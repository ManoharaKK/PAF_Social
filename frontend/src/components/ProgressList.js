import React from "react";
import { ListGroup } from "react-bootstrap";
import { format } from "date-fns";

const ProgressList = ({ progressList, onSelect, selectedId }) => {
  const getGoalTypeBadgeClass = (goalType) => {
    switch (goalType.toLowerCase()) {
      case "weight":
        return "weight-badge";
      case "strength":
        return "strength-badge";
      case "cardio":
        return "cardio-badge";
      case "endurance":
        return "endurance-badge";
      case "flexibility":
        return "flexibility-badge";
      default:
        return "weight-badge";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "MMM dd, yyyy");
  };

  return (
    <ListGroup variant="flush">
      {progressList.map((progress) => (
        <div
          key={progress.id}
          className={`goal-item ${progress.id === selectedId ? "selected" : ""}`}
          onClick={() => onSelect(progress.id)}
        >
          <div className="goal-title">{progress.goalDescription}</div>
          <div className="goal-subtitle">
            <span className={`goal-type-badge me-2 ${getGoalTypeBadgeClass(progress.goalType)}`}>
              {progress.goalType}
            </span>
            <span>Target: {formatDate(progress.targetDate)}</span>
          </div>
          <div className="mt-2">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-value">{Math.round(progress.progressPercentage)}%</div>
          </div>
        </div>
      ))}
    </ListGroup>
  );
};

export default ProgressList; 