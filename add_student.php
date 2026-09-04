<?php

header("Content-Type: application/json");

include "db.php";

$mentor_id = $_POST["mentor_id"] ?? "";
$student_name = $_POST["student_name"] ?? "";
$student_email = $_POST["student_email"] ?? "";

if (empty($mentor_id) || empty($student_name) || empty($student_email)) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

// Check if mentor exists and has capacity
$mentorSql = "SELECT m.id, m.max_mentees, COUNT(s.id) as current_mentees
              FROM mentors m
              LEFT JOIN students s ON m.id = s.mentor_id
              WHERE m.id = ?
              GROUP BY m.id";

$mentorStmt = $conn->prepare($mentorSql);
$mentorStmt->bind_param("i", $mentor_id);
$mentorStmt->execute();
$mentorResult = $mentorStmt->get_result();
$mentor = $mentorResult->fetch_assoc();
$mentorStmt->close();

if (!$mentor) {
    echo json_encode([
        "success" => false,
        "message" => "Mentor not found"
    ]);
    exit;
}

if ($mentor['current_mentees'] >= $mentor['max_mentees']) {
    echo json_encode([
        "success" => false,
        "message" => "Mentor has reached maximum mentees limit"
    ]);
    exit;
}

// Add student
$sql = "INSERT INTO students (mentor_id, student_name, student_email) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $mentor_id, $student_name, $student_email);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Student added successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>
