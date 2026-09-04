<?php

header("Content-Type: application/json");

include "db.php";

$id = $_POST["id"] ?? "";
$mentorName = $_POST["mentorName"] ?? "";
$employeeId = $_POST["employeeId"] ?? "";
$department = $_POST["department"] ?? "";
$designation = $_POST["designation"] ?? "";
$maxMentees = $_POST["maxMentees"] ?? "";

if (
    empty($id) ||
    empty($mentorName) ||
    empty($employeeId) ||
    empty($department) ||
    empty($designation) ||
    empty($maxMentees)
) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

if (isset($_FILES["profilePhoto"]) && $_FILES["profilePhoto"]["error"] === 0) {

    $allowedTypes = ["image/jpeg", "image/png"];

    if (!in_array($_FILES["profilePhoto"]["type"], $allowedTypes)) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG and PNG images are allowed"
        ]);
        exit;
    }

    // Get old photo to delete it
    $selectSql = "SELECT profile_photo FROM mentors WHERE id = ?";
    $selectStmt = $conn->prepare($selectSql);
    $selectStmt->bind_param("i", $id);
    $selectStmt->execute();
    $result = $selectStmt->get_result();
    $oldMentor = $result->fetch_assoc();
    
    if ($oldMentor && !empty($oldMentor['profile_photo'])) {
        $oldPhotoPath = "uploads/" . $oldMentor['profile_photo'];
        if (file_exists($oldPhotoPath)) {
            unlink($oldPhotoPath);
        }
    }
    $selectStmt->close();

    $extension = pathinfo($_FILES["profilePhoto"]["name"], PATHINFO_EXTENSION);

    $photoName = uniqid("mentor_") . "." . $extension;

    $uploadPath = "uploads/" . $photoName;

    move_uploaded_file(
        $_FILES["profilePhoto"]["tmp_name"],
        $uploadPath
    );

    $sql = "UPDATE mentors
            SET mentor_name = ?,
                employee_id = ?,
                department = ?,
                designation = ?,
                max_mentees = ?,
                profile_photo = ?
            WHERE id = ?";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "ssssisi",
        $mentorName,
        $employeeId,
        $department,
        $designation,
        $maxMentees,
        $photoName,
        $id
    );

} else {

    $sql = "UPDATE mentors
            SET mentor_name = ?,
                employee_id = ?,
                department = ?,
                designation = ?,
                max_mentees = ?
            WHERE id = ?";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "ssssii",
        $mentorName,
        $employeeId,
        $department,
        $designation,
        $maxMentees,
        $id
    );
}

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Mentor updated successfully"
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