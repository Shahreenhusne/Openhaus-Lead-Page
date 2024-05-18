import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import "./addBuilding.css"

function addBuilding() {
  const { projectId } = useParams();
  const formControlRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [formData, setFormData] = useState({
    building_name: "",
    constructor_name: "",
    building_superstruct: "",
    building_substruct: "",
    building_structsystem: "",
    building_archstyle: "",
    maintenance_cost: "",
    surfacepark_cost: "",
    stackedpark_cost: "",
    total_floor: "",
    refuge_floor: "",
    no_of_apartments: "",
    typology: "",
    building_image: null,
  });

  const [projectNameError, setProjectNameError] = useState(false);
  const [buildingNameError, setBuildingNameError] = useState(false);
  return (
    <>
      <h3 className="top-heading">Add Building</h3>
      <Row>
        <Col className="p-0">
          <Accordion flush className="accordion-block" defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Building Information</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col className="p-0">
                    <div className="project-info-form-wrapper">
                      <div className="input-form-area">
                        <div className="input-form-area-body">
                          <Form.Group
                            controlId="formBasicText"
                            className="form-input-item"
                          >
                            <Form.Label>
                              Building Name{" "}
                              <span className="asterisk-mark">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter Building Name"
                              name="project_name"
                              required={true}
                            />
                            {/* <div className="edit-form-control-bottom-border" /> */}
                            <div className="input-bottom-divider" />
                            {buildingNameError && (
                              <div className="nameError d-flex text-danger">
                                * Please provide Building name.
                              </div>
                            )}
                          </Form.Group>
                          <Form.Group
                            controlId="formBasicText"
                            className="form-input-item"
                          >
                            <Form.Label>Constructor Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter Constructor Name"
                              name="project_name"
                              required={true}
                            />
                            {/* <div className="edit-form-control-bottom-border" /> */}
                            <div className="input-bottom-divider" />
                            {projectNameError && (
                              <div className="nameError d-flex text-danger">
                                * Please provide project name.
                              </div>
                            )}
                          </Form.Group>
                          <Form.Group
                            controlId="formBasicText"
                            className="form-input-item"
                          >
                            <Form.Label>Building Superstruct</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter Building Superstruct"
                              name="project_name"
                              required={true}
                            />
                            {/* <div className="edit-form-control-bottom-border" /> */}
                            <div className="input-bottom-divider" />
                            {projectNameError && (
                              <div className="nameError d-flex text-danger">
                                * Please provide project name.
                              </div>
                            )}
                          </Form.Group>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
    </>
  );
}

export default addBuilding;
