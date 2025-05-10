import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, ListGroup, Badge, ProgressBar, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import WorkoutScheduleService from "../services/workout-schedule.service";
import "../styles/WorkoutSchedule.css";

const WorkoutSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or calendar

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleDays, setScheduleDays] = useState([]);
  const [exercises, setExercises] = useState([{ name: "", sets: 3, reps: 10, completed: false }]);
  const [intensity, setIntensity] = useState("medium"); // low, medium, high
  const [duration, setDuration] = useState(45); // in minutes

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await WorkoutScheduleService.getAll();
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load workout schedules");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduleDays([]);
    setExercises([{ name: "", sets: 3, reps: 10, completed: false }]);
    setIntensity("medium");
    setDuration(45);
    setCurrentSchedule(null);
  };

  const handleShowAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleEditSchedule = (schedule) => {
    setCurrentSchedule(schedule);
    setTitle(schedule.title);
    setDescription(schedule.description);
    setScheduleDays(schedule.days || []);
    setExercises(schedule.exercises || []);
    setIntensity(schedule.intensity || "medium");
    setDuration(schedule.duration || 45);
    setShowAddModal(true);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, completed: false }]);
  };

  const handleRemoveExercise = (index) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleDayToggle = (day) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || exercises.some(ex => !ex.name)) {
      toast.error("Please fill all required fields");
      return;
    }

    const scheduleData = {
      title,
      description,
      days: scheduleDays,
      exercises,
      intensity,
      duration
    };

    try {
      if (currentSchedule) {
        await WorkoutScheduleService.update(currentSchedule.id, scheduleData);
        toast.success("Workout schedule updated successfully");
      } else {
        await WorkoutScheduleService.create(scheduleData);
        toast.success("Workout schedule created successfully");
      }
      
      handleCloseModal();
      fetchSchedules();
    } catch (error) {
      toast.error(currentSchedule ? "Failed to update schedule" : "Failed to create schedule");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to delete this workout schedule?")) {
      try {
        await WorkoutScheduleService.remove(id);
        toast.success("Workout schedule deleted successfully");
        fetchSchedules();
      } catch (error) {
        toast.error("Failed to delete workout schedule");
      }
    }
  };

  const handleCompleteExercise = async (scheduleId, exerciseId) => {
    try {
      await WorkoutScheduleService.completeExercise(scheduleId, exerciseId);
      toast.success("Exercise marked as complete");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to update exercise status");
    }
  };

  const calculateProgress = (schedule) => {
    if (!schedule.exercises || schedule.exercises.length === 0) return 0;
    const completedExercises = schedule.exercises.filter(ex => ex.completed).length;
    return Math.round((completedExercises / schedule.exercises.length) * 100);
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case "low": return "#64dfdf";
      case "medium": return "#48bfe3";
      case "high": return "#5e60ce";
      default: return "#48bfe3";
    }
  };

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const renderLoading = () => (
    <Container className="mt-5 text-center">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mt-3">Loading your workout schedules...</h3>
      </div>
    </Container>
  );

  const renderEmptyState = () => (
    <div className="fade-in">
      <Card className="text-center p-5 empty-state">
        <Card.Body>
          <i className="fas fa-dumbbell fa-3x mb-3"></i>
          <h4>No workout schedules yet</h4>
          <p>Create your first workout schedule to get started on your fitness journey!</p>
          <Button variant="primary" onClick={handleShowAddModal}>Create Workout Schedule</Button>
        </Card.Body>
      </Card>
    </div>
  );

  const renderGridView = () => (
    <Row xs={1} md={2} lg={3} className="g-4">
      {schedules.map((schedule, index) => (
        <Col key={schedule.id}>
          <div className="fade-in">
            <Card className="h-100 workout-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{schedule.title}</h5>
                <div>
                  <Button variant="light" size="sm" onClick={() => handleEditSchedule(schedule)}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button variant="light" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <p>{schedule.description}</p>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <Badge 
                      bg="primary" 
                      style={{ backgroundColor: getIntensityColor(schedule.intensity) }}
                      className="me-2"
                    >
                      {schedule.intensity || "Medium"} Intensity
                    </Badge>
                    <Badge bg="secondary">
                      <i className="far fa-clock me-1"></i> {schedule.duration || 45} min
                    </Badge>
                  </div>
                </div>
                
                <h6>Progress</h6>
                <div className="mb-3">
                  <ProgressBar 
                    now={calculateProgress(schedule)} 
                    label={`${calculateProgress(schedule)}%`} 
                    variant="primary" 
                    className="mb-2"
                  />
                </div>
                
                <h6>Schedule Days:</h6>
                <div className="mb-3 days-container">
                  {weekdays.map(day => (
                    <Badge 
                      key={day} 
                      bg={schedule.days && schedule.days.includes(day) ? "primary" : "secondary"}
                      className="me-1 mb-1"
                    >
                      {day.substring(0, 3)}
                    </Badge>
                  ))}
                </div>

                <h6>Exercises:</h6>
                <ListGroup variant="flush" className="exercise-list">
                  {schedule.exercises && schedule.exercises.map((exercise, index) => (
                    <ListGroup.Item 
                      key={index}
                      className={`d-flex justify-content-between align-items-center ${exercise.completed ? 'completed-exercise' : ''}`}
                    >
                      <div>
                        <span className="exercise-name">{exercise.name}</span>
                        <small className="d-block text-muted">
                          {exercise.sets} sets × {exercise.reps} reps
                        </small>
                      </div>
                      <Form.Check 
                        type="checkbox"
                        checked={exercise.completed}
                        onChange={() => handleCompleteExercise(schedule.id, exercise.id)}
                        label=""
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
        </Col>
      ))}
    </Row>
  );

  const renderCalendarView = () => (
    <Card className="calendar-view">
      <Card.Body>
        <div className="calendar-grid">
          <div className="calendar-header">
            {weekdays.map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-body">
            {weekdays.map(day => (
              <div key={day} className="calendar-day-cell">
                {schedules
                  .filter(schedule => schedule.days && schedule.days.includes(day))
                  .map(schedule => (
                    <div key={schedule.id} className="calendar-event" style={{ backgroundColor: getIntensityColor(schedule.intensity) }}>
                      <div className="calendar-event-title">{schedule.title}</div>
                      <div className="calendar-event-time">{schedule.duration} min</div>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="mt-4 workout-schedule-container">
      <Row className="mb-4">
        <Col>
          <div className="fade-in">
            <h2 className="page-title">Workout Schedule</h2>
            <p className="page-subtitle">Track your fitness journey and stay on schedule</p>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <div className="view-toggle me-3">
            <Button 
              variant={viewMode === "grid" ? "primary" : "outline-primary"} 
              className="me-2" 
              onClick={() => setViewMode("grid")}
              size="sm"
            >
              <i className="fas fa-th-large me-1"></i> Grid
            </Button>
            <Button 
              variant={viewMode === "calendar" ? "primary" : "outline-primary"} 
              onClick={() => setViewMode("calendar")}
              size="sm"
            >
              <i className="fas fa-calendar-alt me-1"></i> Calendar
            </Button>
          </div>
          <div className="button-hover-effect">
            <Button variant="primary" onClick={handleShowAddModal} className="add-workout-btn">
              <i className="fas fa-plus"></i> Create New Workout
            </Button>
          </div>
        </Col>
      </Row>

      {loading ? (
        renderLoading()
      ) : schedules.length === 0 ? (
        renderEmptyState()
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderCalendarView()
      )}

      {/* Add/Edit Workout Schedule Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentSchedule ? "Edit" : "Create"} Workout Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Upper Body Workout" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                placeholder="Brief description of this workout schedule" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Intensity</Form.Label>
                  <Form.Select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    min="5"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Schedule Days</Form.Label>
              <div className="d-flex flex-wrap">
                {weekdays.map(day => (
                  <Form.Check
                    key={day}
                    inline
                    type="checkbox"
                    id={`day-${day}`}
                    label={day}
                    checked={scheduleDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="me-3 mb-2"
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exercises</Form.Label>
              {exercises.map((exercise, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col xs={12} sm={5}>
                    <Form.Control 
                      type="text" 
                      placeholder="Exercise name" 
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={6} sm={2}>
                    <Form.Control 
                      type="number" 
                      placeholder="Sets" 
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                      min="1"
                    />
                    <small className="text-muted">Sets</small>
                  </Col>
                  <Col xs={6} sm={2}>
                    <Form.Control 
                      type="number" 
                      placeholder="Reps" 
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                      min="1"
                    />
                    <small className="text-muted">Reps</small>
                  </Col>
                  <Col xs={12} sm={3} className="d-flex justify-content-end">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveExercise(index)}
                      disabled={exercises.length === 1}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleAddExercise}
                className="mt-2"
              >
                <i className="fas fa-plus"></i> Add Exercise
              </Button>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentSchedule ? "Update" : "Create"} Workout Schedule
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default WorkoutSchedule;