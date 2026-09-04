<?php

header("Content-Type: application/json");

include "db.php";

$mentor_id = $_GET["mentor_id"] ?? "";

if (empty($mentor_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Mentor ID is required"
    ]);
    exit;
}

$sql = "SELECT id, student_name, student_email, created_at 
        FROM students 
        WHERE mentor_id = ?
        ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $mentor_id);
$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode([
    "success" => true,
    "students" => $students
]);

$stmt->close();
$conn->close();

?>
