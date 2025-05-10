import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import AuthService from "../services/auth.service";

const NavBar = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check and update current user
  const checkUserStatus = () => {
    const user = AuthService.getCurrentUser();
    console.log("Checking user status:", user ? user.username : "No user");
    setCurrentUser(user || undefined);
  };

  // Check user status on component mount
  useEffect(() => {
    checkUserStatus();
  }, []);
  
  // Re-check user status whenever location changes (navigation occurs)
  useEffect(() => {
    console.log("Location changed to:", location.pathname);
    checkUserStatus();
  }, [location]);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    navigate("/");
    window.location.reload();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      <Container fluid>
        <Navbar.Brand as={Link} to={currentUser ? "/wall" : "/"}>
          CALISTHENICFLOW
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/wall">
                  <i className="fas fa-home me-1"></i> Feed
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  <i className="fas fa-user me-1"></i> Profile
                </Nav.Link>
                <Nav.Link as={Link} to="/progress">
                  <i className="fas fa-chart-line me-1"></i> Self Progress
                </Nav.Link>
                <Nav.Link as={Link} to="/workout-schedule">
                  <i className="fas fa-calendar-alt me-1"></i> Workout Schedule
                </Nav.Link>
              </>
            )}
          </Nav>

          {currentUser ? (
            <Nav>
              <span className="navbar-text me-3 d-none d-md-block">
                Welcome, {currentUser.username}
              </span>
              <Button variant="outline-light" onClick={logOut}>
                <i className="fas fa-sign-out-alt me-1"></i> Log Out
              </Button>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login">
                <i className="fas fa-sign-in-alt me-1"></i> Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register">
                <i className="fas fa-user-plus me-1"></i> Sign Up
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar; 