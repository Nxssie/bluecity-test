import React from 'react';
import { MyNavbar } from '../my-navbar/my-navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export class Main extends React.Component {

  constructor(props){
    super(props);

    console.log("Main")
    console.log(this.props.history);
  }
  
  render() {
    return (
      <>
        <MyNavbar history={this.props.history} />
        <Container className="p-3">
          <Row>
            <img className="img-fluid" src="img/bluecity.jpg" alt="logo" />
          </Row>
          <Row>
            <Col>
              <img className="img-fluid" src="img/marker.png" alt="marker" />
            </Col>
            <Col>
              <Row>
                <Button variant="outline-primary" className="mt-2" href="/parking-search">Own scooter parking</Button>
              </Row>
              <Row>
                <Button variant="outline-primary" className="mt-2" href="/rent">Scooter renting</Button>
              </Row>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}