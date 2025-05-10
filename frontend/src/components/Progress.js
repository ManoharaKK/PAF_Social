import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import ProgressService from "../services/progress.service";
import ProgressList from "./ProgressList";
import ProgressForm from "./ProgressForm";
import ProgressDetail from "./ProgressDetail";
import "./progress.css";

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    
    if (!user) {
      setRedirect("/login");
    } else {
      setCurrentUser(user);
      fetchProgressList();
    }
  }, [refreshTrigger]);

  const fetchProgressList = useCallback(() => {
    setLoading(true);
    setError(null);
    
    // Check if user is authenticated first
    const user = AuthService.getCurrentUser();
    if (!user || !user.token) {
      setError("You need to be logged in to view progress data.");
      setLoading(false);
      return;
    }
    
    console.log("Fetching progress with token:", user.token.substring(0, 10) + "...");
    
    ProgressService.getAll()
      .then((response) => {
        setProgressList(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching progress list:", error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const status = error.response.status;
          if (status === 401 || status === 403) {
            setError("Authentication error. Please log in again.");
            // Redirect to login on auth error
            AuthService.logout();
            setRedirect("/login");
          } else if (status === 500) {
            setError("Server error. Please try again later.");
          } else {
            setError(`Error: ${error.response.data}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError("No response from server. Please check your connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${error.message}`);
        }
        setLoading(false);
      });
  }, [setRedirect]);

  const handleAddProgress = () => {
    setSelectedProgress(null);
    setShowAddForm(true);
  };

  const handleProgressSaved = () => {
    setShowAddForm(false);
    setSelectedProgress(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedProgress(null);
  };

  const handleSelectProgress = (progressId) => {
    const selected = progressList.find(p => p.id === progressId);
    setSelectedProgress(selected);
    setShowAddForm(false);
  };

  const handleDeleteProgress = async (progressId) => {
    try {
      await ProgressService.remove(progressId);
      if (selectedProgress && selectedProgress.id === progressId) {
        setSelectedProgress(null);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting progress:", err);
      setError("Failed to delete progress. Please try again.");
    }
  };

  const handleHistoryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    if (selectedProgress) {
      const fetchSelectedProgress = async () => {
        try {
          const response = await ProgressService.getById(selectedProgress.id);
          setSelectedProgress(response.data);
        } catch (err) {
          console.error("Error refreshing progress details:", err);
        }
      };
      fetchSelectedProgress();
    }
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <Container className="py-5 progress-container">
      <h1 className="text-center mb-5">
        <i className="fas fa-chart-line me-2"></i>
        Self Progress Tracker
      </h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm progress-card">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">Your Goals</h5>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddProgress}
                className="rounded-circle"
              >
                <i className="fas fa-plus"></i>
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : progressList.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-muted mb-3">You don't have any goals set yet.</p>
                  <Button 
                    variant="outline-primary" 
                    onClick={handleAddProgress}
                    className="rounded-pill"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Your First Goal
                  </Button>
                </div>
              ) : (
                <ProgressList 
                  progressList={progressList} 
                  onSelect={handleSelectProgress}
                  selectedId={selectedProgress?.id}
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {showAddForm ? (
            <Card className="shadow-sm progress-card">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{selectedProgress ? 'Edit Goal' : 'Add New Goal'}</h5>
              </Card.Header>
              <Card.Body>
                <ProgressForm 
                  progress={selectedProgress}
                  onSave={handleProgressSaved}
                  onCancel={handleCancel}
                />
              </Card.Body>
            </Card>
          ) : selectedProgress ? (
            <ProgressDetail 
              progress={selectedProgress} 
              onEdit={() => setShowAddForm(true)}
              onDelete={handleDeleteProgress}
              onHistoryAdded={handleHistoryAdded}
            />
          ) : (
            <div className="h-100 d-flex flex-column justify-content-center align-items-center p-5 text-center">
              <div className="mb-4">
                <i className="fas fa-chart-line fa-4x text-muted"></i>
              </div>
              <h3>Track Your Fitness Journey</h3>
              <p className="text-muted mb-4">
                Set goals, track your progress, and celebrate your achievements.
                Whether you're losing weight, gaining muscle, or improving endurance, 
                this tool will help you visualize your journey.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleAddProgress}
                className="rounded-pill"
              >
                <i className="fas fa-plus me-2"></i>
                Create Your First Goal
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Progress; 