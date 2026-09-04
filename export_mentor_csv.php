<?php

header("Content-Type: text/csv; charset=utf-8");
header("Content-Disposition: attachment; filename=mentor_" . date('Y-m-d') . ".csv");

include "db.php";

$mentor_id = $_GET["id"] ?? "";

if (empty($mentor_id)) {
    die("Mentor ID is required");
}

// Get mentor details with students
$sql = "SELECT m.*, 
        COALESCE(COUNT(s.id), 0) as current_mentees
        FROM mentors m
        LEFT JOIN students s ON m.id = s.mentor_id
        WHERE m.id = ?
        GROUP BY m.id";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $mentor_id);
$stmt->execute();
$result = $stmt->get_result();
$mentor = $result->fetch_assoc();
$stmt->close();

if (!$mentor) {
    die("Mentor not found");
}

// Create CSV output
$output = fopen("php://output", "w");

// Add mentor header
fputcsv($output, ["MENTOR INFORMATION"]);
fputcsv($output, []);
fputcsv($output, ["Mentor Name", $mentor['mentor_name']]);
fputcsv($output, ["Employee ID", $mentor['employee_id']]);
fputcsv($output, ["Department", $mentor['department']]);
fputcsv($output, ["Designation", $mentor['designation']]);
fputcsv($output, ["Max Mentees", $mentor['max_mentees']]);
fputcsv($output, ["Current Mentees", $mentor['current_mentees']]);
fputcsv($output, []);

// Add students section
fputcsv($output, ["ASSIGNED STUDENTS"]);
fputcsv($output, ["Student ID", "Student Name", "Email", "Assigned Date"]);

// Get all students for this mentor
$studentSql = "SELECT id, student_name, student_email, created_at 
               FROM students 
               WHERE mentor_id = ?
               ORDER BY created_at DESC";

$studentStmt = $conn->prepare($studentSql);
$studentStmt->bind_param("i", $mentor_id);
$studentStmt->execute();
$studentResult = $studentStmt->get_result();

while ($student = $studentResult->fetch_assoc()) {
    fputcsv($output, [
        $student['id'],
        $student['student_name'],
        $student['student_email'],
        $student['created_at']
    ]);
}

$studentStmt->close();

fclose($output);
$conn->close();

?>
