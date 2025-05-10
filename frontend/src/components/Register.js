import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import AuthService from "../services/auth.service";
import "./auth.css";

const Register = () => {
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .test(
        "len",
        "Username must be between 3 and 20 characters",
        (val) =>
          val && val.toString().length >= 3 && val.toString().length <= 20
      )
      .required("Username is required"),
    email: Yup.string()
      .email("This is not a valid email")
      .required("Email is required"),
    password: Yup.string()
      .test(
        "len",
        "Password must be between 6 and 40 characters",
        (val) =>
          val && val.toString().length >= 6 && val.toString().length <= 40
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required("Password confirmation is required"),
    fullName: Yup.string().required("Full name is required")
  });

  const handleRegister = (formValue) => {
    const { username, email, password, fullName } = formValue;

    setMessage("");
    setSuccessful(false);
    setLoading(true);

    AuthService.register(
      username,
      email,
      password,
      fullName
    ).then(
      (response) => {
        console.log("Registration successful:", response);
        setMessage(response?.data?.message || "Registration successful!");
        setSuccessful(true);
        
        // Auto login after successful registration
        console.log("Attempting automatic login after registration");
        
        // Short delay to ensure registration is fully processed
        setTimeout(() => {
          AuthService.login(username, password)
            .then(loginResponse => {
              console.log("Auto-login successful:", loginResponse);
              // Redirect to wall page
              window.location.href = "/wall";
            })
            .catch(loginError => {
              console.error("Auto-login failed:", loginError);
              // Still redirect to login page
              navigate("/login");
            })
            .finally(() => {
              setLoading(false);
            });
        }, 1000);
      },
      (error) => {
        console.error("Registration error:", error);
        const resMessage =
          (error?.response?.data?.message) ||
          (error?.message) ||
          "Registration failed. Please try again.";

        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      }
    );
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background"></div>
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={6} className="auth-container">
            <div className="logo-area text-center mb-4">
              <h1 className="brand-name">CALISTHENIC<span>FLOW</span></h1>
              <p className="brand-tagline">Strength Through Movement</p>
            </div>
            
            <Card className="auth-card">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="auth-title">Join Our Community</h2>
                  <p className="auth-subtitle">Create an account to start your calisthenics journey</p>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleRegister}
                >
                  {({ errors, touched }) => (
                    <Form>
                      {!successful && (
                        <div className="registration-form">
                          <Row>
                            <Col md={12}>
                              <div className="form-group mb-3">
                                <label htmlFor="fullName" className="auth-label">Full Name</label>
                                <div className="input-icon-wrapper">
                                  <i className="input-icon fas fa-user"></i>
                                  <Field
                                    name="fullName"
                                    type="text"
                                    className={
                                      "form-control auth-input" +
                                      (errors.fullName && touched.fullName
                                        ? " is-invalid"
                                        : "")
                                    }
                                    placeholder="Your full name"
                                  />
                                </div>
                                <ErrorMessage
                                  name="fullName"
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>

                            <Col md={6}>
                              <div className="form-group mb-3">
                                <label htmlFor="username" className="auth-label">Username</label>
                                <div className="input-icon-wrapper">
                                  <i className="input-icon fas fa-at"></i>
                                  <Field
                                    name="username"
                                    type="text"
                                    className={
                                      "form-control auth-input" +
                                      (errors.username && touched.username
                                        ? " is-invalid"
                                        : "")
                                    }
                                    placeholder="Choose a username"
                                  />
                                </div>
                                <ErrorMessage
                                  name="username"
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>

                            <Col md={6}>
                              <div className="form-group mb-3">
                                <label htmlFor="email" className="auth-label">Email</label>
                                <div className="input-icon-wrapper">
                                  <i className="input-icon fas fa-envelope"></i>
                                  <Field
                                    name="email"
                                    type="email"
                                    className={
                                      "form-control auth-input" +
                                      (errors.email && touched.email
                                        ? " is-invalid"
                                        : "")
                                    }
                                    placeholder="Your email address"
                                  />
                                </div>
                                <ErrorMessage
                                  name="email"
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>

                            <Col md={6}>
                              <div className="form-group mb-3">
                                <label htmlFor="password" className="auth-label">Password</label>
                                <div className="input-icon-wrapper">
                                  <i className="input-icon fas fa-lock"></i>
                                  <Field
                                    name="password"
                                    type="password"
                                    className={
                                      "form-control auth-input" +
                                      (errors.password && touched.password
                                        ? " is-invalid"
                                        : "")
                                    }
                                    placeholder="Create a password"
                                  />
                                </div>
                                <ErrorMessage
                                  name="password"
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>

                            <Col md={6}>
                              <div className="form-group mb-3">
                                <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                                <div className="input-icon-wrapper">
                                  <i className="input-icon fas fa-shield-alt"></i>
                                  <Field
                                    name="confirmPassword"
                                    type="password"
                                    className={
                                      "form-control auth-input" +
                                      (errors.confirmPassword && touched.confirmPassword
                                        ? " is-invalid"
                                        : "")
                                    }
                                    placeholder="Confirm your password"
                                  />
                                </div>
                                <ErrorMessage
                                  name="confirmPassword"
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                          </Row>

                          <div className="form-check mb-4 mt-2">
                            <input className="form-check-input" type="checkbox" id="termsCheck" />
                            <label className="form-check-label" htmlFor="termsCheck">
                              I agree to the <Link to="#" className="auth-link">Terms of Service</Link> and <Link to="#" className="auth-link">Privacy Policy</Link>
                            </label>
                          </div>

                          <div className="form-group mt-4">
                            <Button
                              type="submit"
                              className="btn-auth-submit w-100"
                            >
                              <i className="fas fa-user-plus me-2"></i>
                              Create Account
                            </Button>
                          </div>
                        </div>
                      )}

                      {message && (
                        <div className="form-group mt-3">
                          <Alert
                            variant={successful ? "success" : "danger"}
                            className="auth-alert"
                          >
                            <i className={successful ? "fas fa-check-circle me-2" : "fas fa-exclamation-circle me-2"}></i>
                            {message}
                          </Alert>
                        </div>
                      )}
                    </Form>
                  )}
                </Formik>
                
                <div className="mt-4 text-center auth-footer">
                  <p>Already have an account? <Link to="/" className="auth-link">Sign In</Link></p>
                </div>
              </Card.Body>
            </Card>
            
            <div className="auth-benefits mt-4">
              <h4 className="benefits-title">Why join CalisthenicFlow?</h4>
              <Row className="mt-3">
                <Col xs={4} className="text-center">
                  <div className="benefit-item">
                    <i className="fas fa-dumbbell benefit-icon"></i>
                    <p>Custom Workouts</p>
                  </div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="benefit-item">
                    <i className="fas fa-chart-line benefit-icon"></i>
                    <p>Progress Tracking</p>
                  </div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="benefit-item">
                    <i className="fas fa-users benefit-icon"></i>
                    <p>Community Support</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register; 