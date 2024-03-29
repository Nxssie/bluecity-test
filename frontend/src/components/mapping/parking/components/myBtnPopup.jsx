import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";


/**
|--------------------------------------------------
| Libraries
|--------------------------------------------------
*/
import { Button } from 'react-bootstrap';

const MyBtnPopup = ({ text, p, type, checkingForRenting, returningScooter }) => {

    let history = useHistory();

    const redirectToDetailedParking = (p) => {
        history.push({
            pathname: '/availability',
            state: {
                parking: p,
                checkingForRenting,
                returningScooter
            }
        })
    };

    const typeOfBtn = (type, text) => {
        switch (type) {
            case 'boxes':
                return (
                    <Button onClick={() => redirectToDetailedParking(p)}>
                        {text}
                    </Button>
                );
            case 'scooter':
                return (
                    <Button onClick={() => redirectToDetailedParking(p)}>
                        {text}
                    </Button>
                );
            default:
                break;
        }
    }; 

    return typeOfBtn(type, text)
};

MyBtnPopup.propTypes = {
    text: PropTypes.string.isRequired,
    p: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    checkingForRenting: PropTypes.bool.isRequired,
    returningScooter: PropTypes.bool.isRequired
};

export default MyBtnPopup;
