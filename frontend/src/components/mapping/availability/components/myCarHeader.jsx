import React from 'react';
import PropTypes from 'prop-types';

/**
|--------------------------------------------------
| Libraries
|--------------------------------------------------
*/
import { Card } from 'react-bootstrap';

const MyCarHeader = ({ address, name }) => {
    return (
        <Card.Header>
            <Card.Title>{name}</Card.Title>
            <Card.Text>{address}</Card.Text>
        </Card.Header>
    )
};

MyCarHeader.propTypes = {
    address: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
};

export default MyCarHeader;
