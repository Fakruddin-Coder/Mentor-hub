-- ==========================================================================
-- MentorHub Database Setup Schema (InfinityFree version)
-- Import this file directly into your InfinityFree database via phpMyAdmin
-- ==========================================================================

-- 1. Create Mentors Table
CREATE TABLE IF NOT EXISTS mentors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    max_mentees INT NOT NULL,
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Sample Data for Mentors (Optional)
INSERT IGNORE INTO mentors (id, mentor_name, employee_id, department, designation, max_mentees) VALUES
(1, 'Dr. Sarah Jenkins', 'EMP1001', 'Computer Science', 'Professor', 5),
(2, 'Prof. Marcus Vance', 'EMP1002', 'Information Technology', 'Associate Professor', 4),
(3, 'Dr. Elena Rostova', 'EMP1003', 'Electronics', 'Assistant Professor', 6);

-- 4. Sample Data for Students (Optional)
INSERT IGNORE INTO students (id, mentor_id, student_name, student_email) VALUES
(1, 1, 'Alex Rivera', 'alex.rivera@univ.edu'),
(2, 1, 'Emma Watson', 'emma.w@univ.edu'),
(3, 2, 'Sophia Loren', 'sophia@univ.edu');
