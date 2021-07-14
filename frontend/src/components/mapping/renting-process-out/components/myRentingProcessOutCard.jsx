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
import { faCheckCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Card, Col, Row } from 'react-bootstrap';

/**
|--------------------------------------------------
| Constants
|--------------------------------------------------
*/
import {
  RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED,
  RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED,
  RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED,
  RENTING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT
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

const MyRentingProcessOutCard = ({ parking, stateRentingProcess, noResponseFromParkingDevice, continueWithProcess, doorClosedBeforeDetectorFires }) => {

  const classes = useStyles();

  const { t } = useTranslation();

  const { id, address, name } = parking;

  const percentage = 25;

  return (
    <>
      <MyCarHeader
        address={address}
        name={name}
      />
      <MyCarImg id={id} />
      <Card.Body>
        {noResponseFromParkingDevice ?
          <>
            <MyMarker
              color='blue'
              state={null}
              text={t('No response from Parking device...')}
              icon={faInfoCircle}
            />
            <Grid
              container
              className={classes.buttonContainer}
              direction="column"
            >
              <Grid item xs={12}>
                <Button variant="contained" className={classes.buttons} onClick={continueWithProcess}>
                  {t('Continue')}
                </Button>
              </Grid>
            </Grid>
          </>
          :
          <>
            <Card.Title>{t('Renting process steps...')}</Card.Title>
            <Row className='pt-2'>
              <Col>
                {stateRentingProcess === RENTING_MODE_PULLING_OUT_SCOOTER_ORDER_TO_OPEN_DOOR_SENT ?
                  <Grid>
                    <CircularProgress value={percentage} size={15} text={`${percentage}%`} />
                    <MyMarker
                      icon={null}
                      color={stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                      state={null}
                      text={t('Open box')}
                    />
                  </Grid>
                  :
                  <MyMarker
                    color={stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                    state={null}
                    text={t('Open box')}
                    icon={stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ? faCheckCircle : faTimes}
                  />
                }
              </Col>
            </Row>
            <Row className='pt-2'>
              <Col>
                {stateRentingProcess === RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_OPEN_CONFIRMATION_RECEIVED ?
                  <Grid>
                    <CircularProgress value={percentage} size={15} text={`${percentage}%`} />
                    <MyMarker
                      icon={null}
                      color={stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                      state={null}
                      text={t('Pull out the scooter')}
                    />
                  </Grid>
                  :
                  <MyMarker
                    color={stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                    state={null}
                    text={t('Pull out the scooter')}
                    icon={stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ? faCheckCircle : faTimes}
                  />
                }
              </Col>
            </Row>
            <Row className='pt-2'>
              <Col>
                {stateRentingProcess === RENTING_MODE_PULLING_OUT_SCOOTER_CHARGER_PULLED_OUT_CONFIRMATION_RECEIVED ?
                  <Grid>
                    <CircularProgress value={percentage} size={15} text={`${percentage}%`} />
                    <MyMarker
                      icon={null}
                      color={doorClosedBeforeDetectorFires || stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                      state={null}
                      text={t('Closed box door')}
                    />
                  </Grid>
                  :
                  <MyMarker
                    color={doorClosedBeforeDetectorFires || stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED ? 'green' : 'red'}
                    state={null}
                    text={t('Closed box door')}
                    icon={doorClosedBeforeDetectorFires || stateRentingProcess >= RENTING_MODE_PULLING_OUT_SCOOTER_DOOR_CLOSED_CONFIRMATION_RECEIVED ? faCheckCircle : faTimes}
                  />
                }
                {doorClosedBeforeDetectorFires ?
                  <Grid
                    container
                    className={classes.buttonContainer}
                    direction="column"
                  >
                    <Grid item xs={12}>
                      <Button variant="contained" className={classes.buttons} onClick={continueWithProcess}>
                        {t('Continue')}
                      </Button>
                    </Grid>
                  </Grid>
                  :
                  <></>
                }
              </Col>
            </Row>
          </>
        }
      </Card.Body>
    </>
  )
};

MyRentingProcessOutCard.propTypes = {
  parking: PropTypes.object.isRequired,
  stateRentingProcess: PropTypes.number.isRequired,
};

export default MyRentingProcessOutCard;