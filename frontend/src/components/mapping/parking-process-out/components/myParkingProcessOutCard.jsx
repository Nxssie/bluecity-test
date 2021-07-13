import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

/**
|--------------------------------------------------
| Components from Availability
|--------------------------------------------------
*/
import MyCarHeader from '../../availability/components/myCarHeader';
import MyCarImg from '../../availability/components/myCarImg';
import MyMarker from '../../availability/components/myMarker';

/**
|--------------------------------------------------
| Libraries
|--------------------------------------------------
*/
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Card, Col, Row } from 'react-bootstrap';

/**
|--------------------------------------------------
| Constants
|--------------------------------------------------
*/
import {
  PARKING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT,
  PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED,
  PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED,
  PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED,
} from '../../constants/constants';

/*-----------------------------------
        Material-UI Imports
------------------------------------*/
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: "10vh",
  },
  image: {
    maxWidth: "512px",
  },
  buttonContainer: {
    justify: "center",
    alignItems: "center",
    //justifyContent: "center",
  },
  buttons: {
    marginTop: "1vh",
    backgroundColor: "#00a9f4",
    "&:hover": {
      backgroundColor: "#007ac1",
      color: "white",
    },
  },
  footer: {
    top: 0,
  },
}));

const MyParkingProcessOutCard = ({ parking, stateParkingProcess, continueWithProcess, doorClosedBeforeDetectorFires, continueWithWhileParking }) => {

  const { id, address, name } = parking;

  const { t } = useTranslation();

  const classes = useStyles();

  var percentage = 25;

  return (
    <>
      <MyCarHeader
        address={address}
        name={name}
      />
      <MyCarImg id={id} />
      <Card.Body>
        <Card.Title>
          {
            stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ?
              <span>{t('Taking your scooter back...')}</span>
              :
              <span>{t('Parking process steps...')}</span>
          }

        </Card.Title>
        <Row className='pt-2'>
          <Col>
          {
            stateParkingProcess === PARKING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT 
          ?
            <Grid>
              <CircularProgress value={percentage} size={20} text={`${percentage}%`}/> 
              <MyMarker
                color={stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                state={null}
                text={t('Open box door')}
              />
            </Grid>
          : 
            <MyMarker
              color={stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ? 'green' : 'red'}
              state={null}
              text={t('Open box door')}
              icon={stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ? faCheckCircle : faTimes}
            />
          }
          </Col>
        </Row>
        <Row className='pt-2'>
          <Col>
          {
						stateParkingProcess === PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED 
					?
						<Grid>
							<CircularProgress value={percentage} size={20} text={`${percentage}%`}/> 
							<MyMarker
								color={stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                state={null}
                text={t('Pull out the scooter')}
							/>
						</Grid>
					: 
            <MyMarker
              color={stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ? 'green' : 'red'}
              state={null}
              text={t('Pull out the scooter')}
              icon={stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ? faCheckCircle : faTimes}
            />
          }
          </Col>
        </Row>
        <Row></Row>
        <Row className='pt-2'>
          <Col>
          {
						stateParkingProcess === PARKING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED 
					?
						<Grid>
							<CircularProgress value={percentage} size={20} text={`${percentage}%`}/> 
							<MyMarker
								color={doorClosedBeforeDetectorFires || stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                state={null}
                text={t('Close box door')}
							/>
						</Grid>
					: 
            <MyMarker
              color={doorClosedBeforeDetectorFires || stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED ? 'green' : 'red'}
              state={null}
              text={t('Close box door')}
              icon={doorClosedBeforeDetectorFires || stateParkingProcess >= PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED ? faCheckCircle : faTimes}
            />
          }
            {doorClosedBeforeDetectorFires ||
              stateParkingProcess == PARKING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED?
                <Grid
                  container
                  className={classes.buttonContainer}
                  direction="column"
                >
                  <Grid item xs={12}>
                    <Button variant="contained" className={classes.buttons} onClick={doorClosedBeforeDetectorFires? continueWithWhileParking : continueWithProcess}>
                      {t('Continue')}
                  </Button>
                  </Grid>
                </Grid>
                :
                <></>
            }
          </Col>
        </Row>
      </Card.Body>
    </>
  )
};

MyParkingProcessOutCard.propTypes = {
  parking: PropTypes.object.isRequired,
  stateParkingProcess: PropTypes.number.isRequired,
};

export default MyParkingProcessOutCard;