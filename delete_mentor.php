<?php

header("Content-Type: application/json");

include "db.php";

$id = $_POST["id"] ?? "";

if (empty($id)) {
    echo json_encode([
        "success" => false,
        "message" => "Mentor ID is required"
    ]);
    exit;
}

// First, get the mentor's photo to delete it
$selectSql = "SELECT profile_photo FROM mentors WHERE id = ?";
$selectStmt = $conn->prepare($selectSql);
$selectStmt->bind_param("i", $id);
$selectStmt->execute();
$result = $selectStmt->get_result();
$mentor = $result->fetch_assoc();

// Delete the photo file if it exists
if ($mentor && !empty($mentor['profile_photo'])) {
    $photoPath = "uploads/" . $mentor['profile_photo'];
    if (file_exists($photoPath)) {
        unlink($photoPath);
    }
}

$selectStmt->close();

// Now delete the database record
$sql = "DELETE FROM mentors WHERE id = ?";

$stmt = $conn->prepare($sql);

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Mentor deleted successfully"
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