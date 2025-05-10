-- Drop tables if they exist
DROP TABLE IF EXISTS workout_schedule_days;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS workout_schedules;

-- Create workout_schedules table
CREATE TABLE IF NOT EXISTS workout_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    intensity VARCHAR(50) DEFAULT 'medium',
    duration INT DEFAULT 45,
    user_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create workout_schedule_days table
CREATE TABLE IF NOT EXISTS workout_schedule_days (
    workout_schedule_id BIGINT NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    PRIMARY KEY (workout_schedule_id, day_name),
    FOREIGN KEY (workout_schedule_id) REFERENCES workout_schedules(id) ON DELETE CASCADE
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sets INT DEFAULT 3,
    reps INT DEFAULT 10,
    completed BOOLEAN DEFAULT FALSE,
    workout_schedule_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (workout_schedule_id) REFERENCES workout_schedules(id) ON DELETE CASCADE
);
