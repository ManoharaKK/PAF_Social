import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ProgressService from "../services/progress.service";

const goalTypes = [
  { value: "weight", label: "Weight Management" },
  { value: "strength", label: "Strength Training" },
  { value: "cardio", label: "Cardiovascular" },
  { value: "endurance", label: "Endurance" },
  { value: "flexibility", label: "Flexibility" }
];

const units = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "cm", label: "Centimeters (cm)" },
  { value: "in", label: "Inches (in)" },
  { value: "reps", label: "Repetitions" },
  { value: "min", label: "Minutes" },
  { value: "km", label: "Kilometers (km)" },
  { value: "miles", label: "Miles" },
  { value: "steps", label: "Steps" }
];

const ProgressForm = ({ progress, onSave, onCancel }) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Schema for validation
  const validationSchema = Yup.object().shape({
    goalType: Yup.string().required("Goal type is required"),
    goalDescription: Yup.string()
      .min(3, "Description must be at least 3 characters")
      .max(100, "Description must be less than 100 characters")
      .required("Description is required"),
    initialValue: Yup.number()
      .required("Initial value is required")
      .typeError("Must be a number"),
    targetValue: Yup.number()
      .required("Target value is required")
      .typeError("Must be a number")
      .test(
        "is-different", 
        "Target value must be different from initial value", 
        function(value) {
          return value !== this.parent.initialValue;
        }
      ),
    unit: Yup.string().required("Unit is required"),
    targetDate: Yup.date()
      .required("Target date is required")
      .min(new Date(), "Target date must be in the future")
  });
  
  // Initial form values
  const initialValues = {
    goalType: progress?.goalType || "weight",
    goalDescription: progress?.goalDescription || "",
    initialValue: progress?.initialValue || 0,
    currentValue: progress?.currentValue || progress?.initialValue || 0, // Include currentValue and default to initialValue
    targetValue: progress?.targetValue || 0,
    unit: progress?.unit || "kg",
    targetDate: progress?.targetDate 
      ? new Date(progress.targetDate).toISOString().substr(0, 10) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10), // 30 days from now
    isCompleted: progress?.isCompleted || false
  };
  
  console.log("Initial form values:", initialValues);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Ensure currentValue is set properly
      const submissionData = {
        ...values,
        // If editing, use existing currentValue or initialValue, else use initialValue 
        currentValue: values.currentValue || values.initialValue || 0
      };
      
      // Convert all numeric fields to proper numbers (not strings)
      submissionData.initialValue = Number(submissionData.initialValue);
      submissionData.currentValue = Number(submissionData.currentValue);
      submissionData.targetValue = Number(submissionData.targetValue);
      
      console.log("Submitting progress data:", submissionData);
      
      if (progress) {
        // Update existing progress
        await ProgressService.update(progress.id, submissionData);
      } else {
        // Create new progress
        await ProgressService.create(submissionData);
      }
      onSave();
    } catch (err) {
      console.error("Error saving progress:", err);
      setError("Failed to save your progress. Please try again.");
      setSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting
      }) => (
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Goal Type</Form.Label>
            <Form.Select
              name="goalType"
              value={values.goalType}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.goalType && !!errors.goalType}
            >
              {goalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.goalType}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Goal Description</Form.Label>
            <Form.Control
              type="text"
              name="goalDescription"
              placeholder="e.g., Reduce body weight, Increase bench press max"
              value={values.goalDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.goalDescription && !!errors.goalDescription}
            />
            <Form.Control.Feedback type="invalid">
              {errors.goalDescription}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Initial Value</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="initialValue"
                  placeholder="Current measurement"
                  value={values.initialValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.initialValue && !!errors.initialValue}
                  disabled={progress !== null} // Can't change initial value when editing
                />
                <Form.Control.Feedback type="invalid">
                  {errors.initialValue}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Target Value</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="targetValue"
                  placeholder="Goal measurement"
                  value={values.targetValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.targetValue && !!errors.targetValue}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.targetValue}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Unit</Form.Label>
                <Form.Select
                  name="unit"
                  value={values.unit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.unit && !!errors.unit}
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.unit}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Target Date</Form.Label>
                <Form.Control
                  type="date"
                  name="targetDate"
                  value={values.targetDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.targetDate && !!errors.targetDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.targetDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          {progress && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isCompleted"
                label="Mark goal as completed"
                checked={values.isCompleted}
                onChange={handleChange}
              />
            </Form.Group>
          )}
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : progress ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProgressForm; 