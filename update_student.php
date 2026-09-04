<?php

header("Content-Type: application/json");

include "db.php";

$student_id = $_POST["student_id"] ?? "";
$student_name = $_POST["student_name"] ?? "";
$student_email = $_POST["student_email"] ?? "";

if (empty($student_id) || empty($student_name) || empty($student_email)) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

$sql = "UPDATE students SET student_name = ?, student_email = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $student_name, $student_email, $student_id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Student updated successfully"
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
