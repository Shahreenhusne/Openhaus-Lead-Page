// import React from "react";
import { Col, Row } from "react-bootstrap";
import React , {useState} from "react"
//images
import openhausLogo from "../../Images/openhaus_logo.svg";

import Form from "../Form/form"

function Navbar() {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  return (
    <Row className="navbar">
      <Col></Col>
      <Col>
        <Logo onClick={toggleModal} />
        {modal && <Form />}
      </Col>
      <Col>
        <BellIcon />
      </Col>
    </Row>
  );
}
function Logo({onClick}) {
  return (
    <div>
      <img onClick={onClick} src={openhausLogo} alt="Openhaus"></img>
    </div>
  );
}

function BellIcon() {
  return <div className="bell-icon">🔔</div>;
}

export default Navbar;
