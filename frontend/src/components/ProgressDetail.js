import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Badge, Alert, Form, Spinner, Modal } from "react-bootstrap";
import { format } from "date-fns";
import ProgressService from "../services/progress.service";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProgressDetail = ({ progress, onEdit, onDelete, onHistoryAdded }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    fetchHistory();
  }, [progress.id]);
  
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await ProgressService.getHistory(progress.id);
      setHistory(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching progress history:", err);
      setError("Failed to load progress history. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddHistorySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await ProgressService.addHistory(progress.id, {
        value: parseFloat(newValue),
        notes: notes
      });
      
      setNewValue("");
      setNotes("");
      setShowAddForm(false);
      fetchHistory();
      onHistoryAdded();
      
    } catch (err) {
      console.error("Error adding progress history:", err);
      setError("Failed to add new measurement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      await onDelete(progress.id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting progress:", err);
      setError("Failed to delete goal. Please try again.");
      setShowDeleteModal(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "MMM dd, yyyy");
  };
  
  const getGoalTypeBadgeClass = (goalType) => {
    switch (goalType.toLowerCase()) {
      case "weight":
        return "bg-success";
      case "strength":
        return "bg-primary";
      case "cardio":
        return "bg-danger";
      case "endurance":
        return "bg-warning";
      case "flexibility":
        return "bg-purple";
      default:
        return "bg-secondary";
    }
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.recordedAt) - new Date(b.recordedAt)
    );
    
    return {
      labels: sortedHistory.map(h => format(new Date(h.recordedAt), "MMM dd")),
      datasets: [
        {
          label: `${progress.goalType} (${progress.unit})`,
          data: sortedHistory.map(h => h.value),
          fill: false,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1
        }
      ]
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Progress Over Time"
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: progress.unit
        }
      }
    }
  };
  
  return (
    <Card className="shadow-sm progress-card">
      <Card.Header className={`bg-primary text-white`}>
        <h5 className="mb-0">Goal Details</h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        <div className="progress-detail-header">
          <div>
            <h3>{progress.goalDescription}</h3>
            <Badge className={`me-2 ${getGoalTypeBadgeClass(progress.goalType)}`}>
              {progress.goalType}
            </Badge>
            <span className="text-muted">
              Started: {formatDate(progress.startedAt)}
            </span>
          </div>
          <div className="progress-actions">
            <Button variant="outline-primary" size="sm" onClick={onEdit}>
              <i className="fas fa-edit me-1"></i> Edit
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleDeleteClick}>
              <i className="fas fa-trash-alt me-1"></i> Delete
            </Button>
          </div>
        </div>
        
        <Row className="mt-4 mb-3">
          <Col md={4}>
            <div className="progress-metric">
              <div className="progress-metric-icon bg-light p-2 rounded">
                <i className="fas fa-play text-muted"></i>
              </div>
              <div>
                <div className="progress-metric-value">
                  {progress.initialValue} {progress.unit}
                </div>
                <div className="progress-metric-label">Initial Value</div>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="progress-metric">
              <div className="progress-metric-icon bg-light p-2 rounded">
                <i className="fas fa-arrow-right text-primary"></i>
              </div>
              <div>
                <div className="progress-metric-value">
                  {progress.currentValue} {progress.unit}
                </div>
                <div className="progress-metric-label">Current Value</div>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="progress-metric">
              <div className="progress-metric-icon bg-light p-2 rounded">
                <i className="fas fa-flag-checkered text-success"></i>
              </div>
              <div>
                <div className="progress-metric-value">
                  {progress.targetValue} {progress.unit}
                </div>
                <div className="progress-metric-label">Target Value</div>
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="mt-3 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div>
              <span className="fw-bold">Progress</span>
              <span className="ms-2 text-muted small">
                Target Date: {formatDate(progress.targetDate)}
              </span>
            </div>
            <span className="fw-bold">{Math.round(progress.progressPercentage)}%</span>
          </div>
          <div className="progress-bar-container" style={{ height: "12px" }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Progress Chart */}
        {!loading && history.length > 0 && (
          <div className="progress-chart">
            <Line data={prepareChartData()} options={chartOptions} />
          </div>
        )}
        
        {/* History Section */}
        <div className="mt-4">
          <div className="history-header mb-3">
            <h5>Measurement History</h5>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <i className="fas fa-plus me-1"></i> Add Measurement
            </Button>
          </div>
          
          {showAddForm && (
            <div className="add-history-form mb-4">
              <Form onSubmit={handleAddHistorySubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Value ({progress.unit})</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder={`Enter current ${progress.goalType} value`}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notes (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="E.g., After morning workout"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={submitting || !newValue}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-1"
                        />
                        Saving...
                      </>
                    ) : (
                      "Save Measurement"
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          )}
          
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : history.length === 0 ? (
            <Alert variant="info">
              No measurement history available yet. Add your first measurement!
            </Alert>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="d-flex justify-content-between">
                    <div className="history-value">
                      {item.value} {progress.unit}
                    </div>
                    <div className="history-date">
                      {format(new Date(item.recordedAt), "MMM dd, yyyy h:mm a")}
                    </div>
                  </div>
                  {item.notes && <div className="history-notes">{item.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card.Body>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this goal and all its history? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Goal
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ProgressDetail; 