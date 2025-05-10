import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { 
  getWorkoutSchedules, 
  createWorkoutSchedule, 
  updateWorkoutSchedule, 
  deleteWorkoutSchedule,
  toggleExerciseCompletion
} from '../services/workoutScheduleService';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faDumbbell, faEdit, faTrashAlt, 
  faCheck, faCircle, faCalendarAlt, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import '../styles/WorkoutSchedule.css';

const WorkoutSchedule = () => {
  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    day: '',
    description: '',
    color: '#4e73df',
    exercises: []
  });
  const [newExercise, setNewExercise] = useState({ 
    name: '', 
    sets: '', 
    reps: '', 
    weight: '',
    notes: '',
    completed: false 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' or 'calendar'

  // Color options for workouts
  const colorOptions = [
    '#4e73df', // Blue
    '#1cc88a', // Green
    '#f6c23e', // Yellow
    '#e74a3b', // Red
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#20c9a6', // Teal
    '#36b9cc'  // Cyan
  ];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutSchedules();
      setWorkouts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workout schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentWorkout(null);
    setIsEditing(false);
    setFormData({
      title: '',
      day: '',
      description: '',
      color: '#4e73df',
      exercises: []
    });
  };

  const handleShowModal = (workout = null) => {
    if (workout) {
      setCurrentWorkout(workout);
      setFormData({
        title: workout.title,
        day: workout.day,
        description: workout.description || '',
        color: workout.color || '#4e73df',
        exercises: [...workout.exercises]
      });
      setIsEditing(true);
    } else {
      setCurrentWorkout(null);
      setFormData({
        title: '',
        day: '',
        description: '',
        color: '#4e73df',
        exercises: []
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExerciseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise({ ...newExercise, [name]: value });
  };

  const addExercise = () => {
    if (newExercise.name && newExercise.sets && newExercise.reps) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, { ...newExercise, completed: false }]
      });
      setNewExercise({ 
        name: '', 
        sets: '', 
        reps: '', 
        weight: '',
        notes: '',
        completed: false 
      });
    }
  };

  const removeExercise = (index) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises.splice(index, 1);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentWorkout) {
        await updateWorkoutSchedule(currentWorkout._id, formData);
      } else {
        await createWorkoutSchedule(formData);
      }
      
      handleCloseModal();
      fetchWorkouts();
    } catch (err) {
      setError(isEditing ? 'Failed to update workout' : 'Failed to create workout');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkoutSchedule(id);
        fetchWorkouts();
      } catch (err) {
        setError('Failed to delete workout');
        console.error(err);
      }
    }
  };

  const handleToggleCompletion = async (workoutId, exerciseId, completed) => {
    try {
      await toggleExerciseCompletion(workoutId, exerciseId, !completed);
      fetchWorkouts();
    } catch (err) {
      setError('Failed to update exercise status');
      console.error(err);
    }
  };

  const getTotalExercises = (workout) => {
    return workout.exercises.length;
  };

  const getCompletedExercises = (workout) => {
    return workout.exercises.filter(ex => ex.completed).length;
  };

  const getProgressPercentage = (workout) => {
    const total = getTotalExercises(workout);
    if (total === 0) return 0;
    return Math.round((getCompletedExercises(workout) / total) * 100);
  };

  if (loading) {
    return (
      <div className="workout-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your workout schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <FontAwesomeIcon icon={faTimes} size="2x" />
          <h3>{error}</h3>
          <Button variant="outline-primary" onClick={fetchWorkouts}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-schedule-container">
      <div className="workout-header-section">
        <div className="workout-title-area">
          <h1 className="page-title">Workout Schedule</h1>
          <p className="subtitle">Plan, track, and conquer your fitness goals</p>
        </div>
        
        <div className="workout-actions-area">
          <div className="view-toggle-buttons">
            <Button 
              variant={view === 'grid' ? 'primary' : 'outline-primary'} 
              className="me-2"
              onClick={() => setView('grid')}
            >
              <i className="fas fa-th"></i>
            </Button>
            <Button 
              variant={view === 'calendar' ? 'primary' : 'outline-primary'}
              onClick={() => setView('calendar')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
            </Button>
          </div>
          
          <motion.button 
            className="create-workout-button"
            onClick={() => handleShowModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faPlus} /> Create Workout
          </motion.button>
        </div>
      </div>
      
      {workouts.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-state-content">
            <FontAwesomeIcon icon={faDumbbell} size="3x" />
            <h2>No Workouts Yet</h2>
            <p>Create your first workout to start building your perfect routine</p>
            <motion.button 
              className="empty-state-button"
              onClick={() => handleShowModal()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faPlus} /> Create Your First Workout
            </motion.button>
          </div>
        </motion.div>
      ) : view === 'grid' ? (
        <div className="workout-cards">
          {workouts.map((workout, idx) => (
            <motion.div 
              className="workout-card" 
              key={workout._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              style={{ 
                borderTop: `4px solid ${workout.color || '#4e73df'}`,
                background: `linear-gradient(to bottom, ${workout.color || '#4e73df'}10, white)`  
              }}
            >
              <div className="workout-card-header">
                <h3 className="workout-title">{workout.title}</h3>
                <Badge 
                  bg="primary" 
                  className="workout-day"
                  style={{ backgroundColor: workout.color || '#4e73df' }}
                >
                  {workout.day}
                </Badge>
              </div>
              
              {workout.description && (
                <p className="workout-description">{workout.description}</p>
              )}
              
              <div className="progress-container">
                <div className="progress-info">
                  <span>Progress</span>
                  <span>{getCompletedExercises(workout)}/{getTotalExercises(workout)}</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${getProgressPercentage(workout)}%`,
                      backgroundColor: workout.color || '#4e73df' 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="exercise-list">
                <h4>Exercises</h4>
                {workout.exercises.length === 0 ? (
                  <p className="no-exercises">No exercises added yet.</p>
                ) : (
                  <div className="exercise-items">
                    {workout.exercises.map((exercise, index) => (
                      <motion.div 
                        key={index} 
                        className={`exercise-item ${exercise.completed ? 'completed' : ''}`}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleToggleCompletion(workout._id, exercise._id, exercise.completed)}
                      >
                        <div className="exercise-item-content">
                          <div className="exercise-check">
                            <FontAwesomeIcon 
                              icon={exercise.completed ? faCheck : faCircle} 
                              className={exercise.completed ? 'completed-icon' : 'incomplete-icon'}
                            />
                          </div>
                          <div className="exercise-details">
                            <span className="exercise-name">{exercise.name}</span>
                            <span className="exercise-meta">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && ` • ${exercise.weight} kg`}
                            </span>
                            {exercise.notes && (
                              <span className="exercise-notes">{exercise.notes}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="workout-card-actions">
                <Button 
                  variant="light" 
                  className="edit-button"
                  onClick={() => handleShowModal(workout)}
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </Button>
                <Button 
                  variant="light" 
                  className="delete-button"
                  onClick={() => handleDelete(workout._id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="calendar-view">
          <div className="weekday-header">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className="weekday-cell">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const dayWorkouts = workouts.filter(w => w.day === day);
              
              return (
                <div key={day} className="day-cell">
                  {dayWorkouts.length === 0 ? (
                    <div className="empty-day" onClick={() => {
                      const newWorkout = {
                        title: '',
                        day: day,
                        description: '',
                        color: '#4e73df',
                        exercises: []
                      };
                      setFormData(newWorkout);
                      setCurrentWorkout(null);
                      setIsEditing(false);
                      setShowModal(true);
                    }}>
                      <span className="add-to-day">+</span>
                    </div>
                  ) : (
                    dayWorkouts.map(workout => (
                      <div 
                        key={workout._id} 
                        className="calendar-workout"
                        style={{ backgroundColor: workout.color || '#4e73df' }}
                        onClick={() => handleShowModal(workout)}
                      >
                        <h4>{workout.title}</h4>
                        <div className="calendar-progress">
                          {getCompletedExercises(workout)}/{getTotalExercises(workout)} exercises
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Modern Add/Edit Workout Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
        className="workout-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 
              <><FontAwesomeIcon icon={faEdit} /> Edit Workout</> : 
              <><FontAwesomeIcon icon={faPlus} /> Create New Workout</>
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="workout-modal-body">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Workout Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Upper Body, Leg Day, Full Body HIIT"
                required
                className="form-control-modern"
              />
            </Form.Group>
            
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Day of Week</Form.Label>
                  <Form.Select 
                    name="day" 
                    value={formData.day} 
                    onChange={handleInputChange}
                    required
                    className="form-control-modern"
                  >
                    <option value="">Select a day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Workout Color</Form.Label>
                  <div className="color-selector">
                    {colorOptions.map(color => (
                      <div 
                        key={color}
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({...formData, color: color})}
                      >
                        {formData.color === color && <FontAwesomeIcon icon={faCheck} />}
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of this workout routine"
                className="form-control-modern"
              />
            </Form.Group>
            
            <div className="exercises-section">
              <h5>
                <FontAwesomeIcon icon={faDumbbell} /> 
                Exercises ({formData.exercises.length})
              </h5>
              
              {formData.exercises.length > 0 && (
                <Card className="exercise-list-container mb-4">
                  <Card.Body>
                    {formData.exercises.map((exercise, index) => (
                      <motion.div 
                        key={index} 
                        className="exercise-item-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="exercise-item-form-content">
                          <div className="exercise-info">
                            <strong>{exercise.name}</strong>
                            <span>
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && ` • ${exercise.weight} kg`}
                            </span>
                            {exercise.notes && <small className="text-muted">{exercise.notes}</small>}
                          </div>
                          <Button 
                            variant="link" 
                            className="remove-exercise"
                            onClick={() => removeExercise(index)}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </Card.Body>
                </Card>
              )}
              
              <Card className="add-exercise-form">
                <Card.Body>
                  <h6><FontAwesomeIcon icon={faPlus} /> Add Exercise</h6>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Control
                        type="text"
                        name="name"
                        value={newExercise.name}
                        onChange={handleExerciseInputChange}
                        placeholder="Exercise name (e.g., Push-ups, Squats, Deadlifts)"
                        className="form-control-modern"
                      />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Label>Sets</Form.Label>
                      <Form.Control
                        type="number"
                        name="sets"
                        value={newExercise.sets}
                        onChange={handleExerciseInputChange}
                        placeholder="Sets"
                        min="1"
                        className="form-control-modern"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Reps</Form.Label>
                      <Form.Control
                        type="number"
                        name="reps"
                        value={newExercise.reps}
                        onChange={handleExerciseInputChange}
                        placeholder="Reps"
                        min="1"
                        className="form-control-modern"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Weight (kg, optional)</Form.Label>
                      <Form.Control
                        type="number"
                        name="weight"
                        value={newExercise.weight}
                        onChange={handleExerciseInputChange}
                        placeholder="Weight"
                        min="0"
                        className="form-control-modern"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Notes (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="notes"
                        value={newExercise.notes}
                        onChange={handleExerciseInputChange}
                        placeholder="Additional notes (e.g., 'Focus on form', 'Increase weight next time')"
                        className="form-control-modern"
                      />
                    </Col>
                  </Row>
                  <div className="text-end mt-3">
                    <Button 
                      variant="primary" 
                      onClick={addExercise}
                      disabled={!newExercise.name || !newExercise.sets || !newExercise.reps}
                      className="add-exercise-btn"
                    >
                      <FontAwesomeIcon icon={faPlus} /> Add to Workout
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            <div className="modal-action-buttons">
              <Button variant="outline-secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="save-workout-btn"
              >
                {isEditing ? 'Update Workout' : 'Create Workout'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WorkoutSchedule; 