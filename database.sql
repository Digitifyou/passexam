-- Create the main database
CREATE DATABASE quizmasterpro;

-- Use the new database
USE quizmasterpro;

-- Create the Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Exams table
CREATE TABLE Exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    test_type ENUM('practice', 'final') NOT NULL,
    duration INT, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Questions table
CREATE TABLE Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES Exams(exam_id)
);

-- Create the Options table
CREATE TABLE Options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    option_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

-- Create the Test_Attempts table
CREATE TABLE Test_Attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    exam_id INT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status ENUM('in-progress', 'completed') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (exam_id) REFERENCES Exams(exam_id)
);

-- Create the User_Answers table
CREATE TABLE User_Answers (
    user_answer_id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT,
    question_id INT,
    selected_option_id INT,
    is_correct BOOLEAN,
    FOREIGN KEY (attempt_id) REFERENCES Test_Attempts(attempt_id),
    FOREIGN KEY (question_id) REFERENCES Questions(question_id),
    FOREIGN KEY (selected_option_id) REFERENCES Options(option_id)
);

-- Create the User_Test_History table
CREATE TABLE User_Test_History (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT,
    user_id INT,
    exam_id INT,
    score INT NOT NULL,
    correct_count INT NOT NULL,
    incorrect_count INT NOT NULL,
    total_questions INT NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    FOREIGN KEY (attempt_id) REFERENCES Test_Attempts(attempt_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (exam_id) REFERENCES Exams(exam_id)
);