<?php

header("Content-Type: application/json");

include "db.php";

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Get mentors with current mentee count
$sql = "SELECT m.*, 
        COALESCE(COUNT(s.id), 0) as current_mentees
        FROM mentors m
        LEFT JOIN students s ON m.id = s.mentor_id
        GROUP BY m.id
        ORDER BY m.id DESC";

$result = $conn->query($sql);

// Fallback query if students table does not exist yet in database
if (!$result) {
    $sqlFallback = "SELECT *, 0 as current_mentees FROM mentors ORDER BY id DESC";
    $result = $conn->query($sqlFallback);
}

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Query failed: " . $conn->error
    ]);
    exit;
}

$mentors = [];

while ($row = $result->fetch_assoc()) {
    $mentors[] = $row;
}

echo json_encode([
    "success" => true,
    "mentors" => $mentors
]);

$conn->close();

?>