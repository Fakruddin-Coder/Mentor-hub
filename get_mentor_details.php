<?php

header("Content-Type: application/json");

include "db.php";

$mentor_id = $_POST["mentor_id"] ?? "";

if (empty($mentor_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Mentor ID is required"
    ]);
    exit;
}

// Get mentor details with mentee count
$sql = "SELECT m.id, m.mentor_name, m.max_mentees,
        COUNT(s.id) as current_mentees
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
    echo json_encode([
        "success" => false,
        "message" => "Mentor not found"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "mentor" => $mentor
]);

$conn->close();

?>
