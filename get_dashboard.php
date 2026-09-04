<?php

header("Content-Type: application/json");

include "db.php";

// Get total mentors
$mentorSql = "SELECT COUNT(*) as total FROM mentors";
$mentorResult = $conn->query($mentorSql);
$totalMentors = $mentorResult->fetch_assoc()['total'];

// Get total students
$studentSql = "SELECT COUNT(*) as total FROM students";
$studentResult = $conn->query($studentSql);
$totalStudents = $studentResult->fetch_assoc()['total'];

// Get average students per mentor
$avgSql = "SELECT AVG(current_mentees) as avg_students
           FROM (
               SELECT COALESCE(COUNT(s.id), 0) as current_mentees
               FROM mentors m
               LEFT JOIN students s ON m.id = s.mentor_id
               GROUP BY m.id
           ) as mentor_stats";
$avgResult = $conn->query($avgSql);
$avgStudents = round($avgResult->fetch_assoc()['avg_students'], 1);

// Get department distribution
$deptSql = "SELECT department, COUNT(*) as count FROM mentors GROUP BY department ORDER BY count DESC";
$deptResult = $conn->query($deptSql);
$departments = [];
while ($row = $deptResult->fetch_assoc()) {
    $departments[] = $row;
}

// Get mentors at capacity
$capacitySql = "SELECT COUNT(*) as count
                FROM (
                    SELECT m.id, m.max_mentees, COUNT(s.id) as current_mentees
                    FROM mentors m
                    LEFT JOIN students s ON m.id = s.mentor_id
                    GROUP BY m.id
                    HAVING current_mentees >= max_mentees
                ) as at_capacity";
$capacityResult = $conn->query($capacitySql);
$atCapacity = $capacityResult->fetch_assoc()['count'];

echo json_encode([
    "success" => true,
    "totalMentors" => $totalMentors,
    "totalStudents" => $totalStudents,
    "avgStudents" => $avgStudents,
    "departments" => $departments,
    "atCapacity" => $atCapacity,
    "available" => $totalMentors - $atCapacity
]);

$conn->close();

?>
