import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Row, Col, Alert } from "react-bootstrap";
import AuthService from "../services/auth.service";
import "./Profile.css"; // We'll create this file next

const Profile = () => {
  const [redirect, setRedirect] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    try {
      const currentUser = AuthService.getCurrentUser();

      if (!currentUser) {
        setRedirect("/login");
      } else {
        setCurrentUser(currentUser);
        setUserReady(true);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Error loading profile. Please log in again.");
      setRedirect("/login");
    }
  }, []);

  // Reset copy notification after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <Container fluid className="profile-container py-5">
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {userReady && currentUser && (
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <div className="profile-card">
              <div className="profile-header">
                <div className="header-backdrop"></div>
                <div className="avatar-container">
                  <div className="avatar">
                    {getInitials(currentUser.username)}
                  </div>
                </div>
                <h2 className="profile-name">{currentUser.username || "User"}</h2>
                <p className="profile-email">{currentUser.email || "email@example.com"}</p>
              </div>
              
              <div className="profile-nav">
                <button 
                  className={`nav-tab ${activeTab === "personal" ? "active" : ""}`}
                  onClick={() => setActiveTab("personal")}
                >
                  <i className="fas fa-user-circle me-2"></i>
                  Personal Info
                </button>
                <button 
                  className={`nav-tab ${activeTab === "stats" ? "active" : ""}`}
                  onClick={() => setActiveTab("stats")}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Stats
                </button>
                <button 
                  className={`nav-tab ${activeTab === "security" ? "active" : ""}`}
                  onClick={() => setActiveTab("security")}
                >
                  <i className="fas fa-shield-alt me-2"></i>
                  Security
                </button>
              </div>
              
              <div className="profile-content">
                {activeTab === "personal" && (
                  <div className="tab-content">
                    <div className="info-section">
                      <div className="info-card">
                        <div className="info-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="info-details">
                          <h4>Username</h4>
                          <p>{currentUser.username || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="info-card">
                        <div className="info-icon">
                          <i className="fas fa-envelope"></i>
                        </div>
                        <div className="info-details">
                          <h4>Email</h4>
                          <p>{currentUser.email || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="info-card">
                        <div className="info-icon">
                          <i className="fas fa-id-card"></i>
                        </div>
                        <div className="info-details">
                          <h4>Member ID</h4>
                          <p>{currentUser.id || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="user-actions">
                      <button className="action-button">
                        <i className="fas fa-pencil-alt me-2"></i>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
                
                {activeTab === "stats" && (
                  <div className="tab-content">
                    <div className="stats-container">
                      <div className="stat-card">
                        <div className="stat-value">27</div>
                        <div className="stat-label">Workouts</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">7</div>
                        <div className="stat-label">Month Streak</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">96%</div>
                        <div className="stat-label">Completion</div>
                      </div>
                    </div>
                    
                    <div className="progress-section">
                      <h4>Workout Progress</h4>
                      <div className="progress-container">
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Pull-ups</span>
                            <span>12/15</span>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Push-ups</span>
                            <span>20/25</span>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        <div className="progress-item">
                          <div className="progress-label">
                            <span>Squats</span>
                            <span>30/30</span>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "security" && (
                  <div className="tab-content">
                    <div className="token-section">
                      <h4>Authentication Token</h4>
                      <div className="token-container">
                        {currentUser.token ? (
                          <div className="token-display">
                            <p>{currentUser.token.substring(0, 20)}...</p>
                            <button 
                              className="copy-button"
                              onClick={() => copyToClipboard(currentUser.token)}
                              title="Copy token to clipboard"
                            >
                              {copySuccess ? (
                                <i className="fas fa-check"></i>
                              ) : (
                                <i className="fas fa-copy"></i>
                              )}
                            </button>
                          </div>
                        ) : (
                          <p>Token not available</p>
                        )}
                      </div>
                      <div className="security-info">
                        <i className="fas fa-info-circle me-2"></i>
                        <span>Your token is used for authentication. Never share it with others.</span>
                      </div>
                      <div className="security-buttons">
                        <button className="action-button">
                          <i className="fas fa-key me-2"></i>
                          Change Password
                        </button>
                        <button className="action-button danger">
                          <i className="fas fa-ban me-2"></i>
                          Revoke Token
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Profile; 