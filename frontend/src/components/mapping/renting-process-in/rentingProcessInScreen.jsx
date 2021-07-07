//ATENTION: THIS FILE COULD/SHOULD BE MERGED WITH AvailabilityScreen.jsx IN THE FUTURE
//          NOW IT'S JUST A WAY TO WORK IN A MORE UNDERSTANDABLE WAY

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../ui/footer';

/**
|--------------------------------------------------
| Components
|--------------------------------------------------
*/
import { MyNavbar } from '../../ui/navbar/my-navbar';
import { MyContainer } from '../../ui/my-container';
import MyRentingProcessInCard from './components/myRentingProcessInCard';
import MyMarker from '../availability/components/myMarker';

/**
|--------------------------------------------------
| Libraries
|--------------------------------------------------
*/
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Row, Col, Card } from 'react-bootstrap';

/**
|--------------------------------------------------
| Services
|--------------------------------------------------
*/
import BoxDataService from '../../../services/box.service';
import ScooterDataService from '../../../services/scooter.service';

/**
|--------------------------------------------------
| Constants
|--------------------------------------------------
*/
import {
  RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED,
  RENTING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT,
  RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED,
  RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED
} from '../constants/constants';
import { BEGIN_OF_TIMES, getApiUser, NEITHER_PARKING_NOT_RENTING } from '../availability/constants/constants';

const RentingProcessScreen = ({ location, history }) => {

  const { state: { parking, boxId } } = location;

  const { t } = useTranslation();

  const socketRef = useRef();

  const [stateRentingProcess, setStateRentingProcess] = useState(RENTING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT);

  const [doorClosedBeforeDetectorFires, setDoorClosedBeforeDetectorFires] = useState(false);

  const refreshBoxState = () => {
    BoxDataService.get(boxId).then((data) => {
      setStateRentingProcess(
        data.data.state
      );
    });
  }

  const continueWithProcess = () => {
    ScooterDataService.getScooterWithUserId(getApiUser().id).then(data => {
      const scooterData = {
        userId: null,
        lastReservationDate: BEGIN_OF_TIMES,
        boxId
      }
      ScooterDataService.update(data.data.id, scooterData).then(data => {
        const boxData = {
          userId: null,
          lastReservationDate: BEGIN_OF_TIMES,
          state: NEITHER_PARKING_NOT_RENTING,
          occupied: true
        };
        BoxDataService.update(boxId, boxData).then(data => {
          history.push({
            pathname: '/main',
          });
        })
      })
    });

    const data = {
      state: NEITHER_PARKING_NOT_RENTING,
      lastReservationDate: BEGIN_OF_TIMES,
      occupied: true,
      userId: null
    }
    BoxDataService.update(boxId, data).then((res) => {
      history.push("/main")
    }).catch((error) => console.log(error));
  }

  const continueWithWhileRenting = () => {
    console.log("continueWithWhileRenting")
    const boxData = {
      userId: null,
      lastReservationDate: BEGIN_OF_TIMES,
      state: NEITHER_PARKING_NOT_RENTING,
      occupied: false
    };
    BoxDataService.update(boxId, boxData).then(data => {
      history.push({
        pathname: '/while-renting',
      });
    }).catch((error) => console.log(error));
  }

  useEffect(() => {
    refreshBoxState();
  }, []);

  useEffect(() => {
    socketRef.current = socketIOClient(process.env.REACT_APP_BASEURL);

    socketRef.current.on('welcome', () => {
      console.log('connected to backend');
    });

    socketRef.current.on('refresh-box-state', data => {
      if (data.boxId === boxId) {
        if(data.resetFromServer){
          history.push({
            pathname: '/main',
          });
          return;
        }
        if (data.doorClosedBeforeDetectorFires) {
          setDoorClosedBeforeDetectorFires(true);
          return;
        }
        if(data.resetFromServer){
          history.push("/main");
          return;
        }
        refreshBoxState();
      }
    });

    return () => {
      socketRef.current.disconnect();
    }
  }, []);

  return (
    <>
      <MyNavbar history={history} />
      <MyContainer>
        <Row>
          <Card className='m-2'>
            <MyRentingProcessInCard
              parking={parking}
              stateRentingProcess={stateRentingProcess}
              continueWithProcess={continueWithProcess}
              doorClosedBeforeDetectorFires={doorClosedBeforeDetectorFires}
              continueWithWhileRenting={continueWithWhileRenting}
            />
          </Card>
        </Row>
        <Row className='pt-3'>
          <Col>
            {doorClosedBeforeDetectorFires ?
              <MyMarker
                color='blue'
                state={null}
                text={`${t('The door was closed before introducing the scooter')}. ${t('Click continue to try it again...')}.`}
                icon={faInfoCircle}
              />
              :
              stateRentingProcess === RENTING_MODE_INTRODUCING_SCOOTER_ORDER_TO_OPEN_DOOR_SENT
                ?
                <MyMarker
                  color='blue'
                  state={null}
                  text={t('Waiting for the door to get open...')}
                  icon={faInfoCircle}
                />
                : stateRentingProcess === RENTING_MODE_INTRODUCING_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ?
                  <MyMarker
                    color='blue'
                    state={null}
                    text={t('The door is open. Introduce your scooter, plug it in and close the door.')}
                    icon={faInfoCircle}
                  />
                  : stateRentingProcess === RENTING_MODE_INTRODUCING_SCOOTER_CHARGER_PLUGGED_IN_CONFIRMATION_RECEIVED ?
                    <MyMarker
                      color='blue'
                      state={null}
                      text={t('The scooter is in the box. Close the door.')}
                      icon={faInfoCircle}
                    />
                    :
                    <MyMarker
                      color='blue'
                      state={null}
                      text={t('The door is closed. The parking process of your rented scooter is complete.')}
                      icon={faInfoCircle}
                    />
            }
          </Col>
        </Row>
      </MyContainer>
      <Footer/>
    </>
  )
};

RentingProcessScreen.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default RentingProcessScreen;
