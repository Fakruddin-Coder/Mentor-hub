<?php

header("Content-Type: application/json");

include "db.php";

$mentorName = $_POST["mentorName"] ?? "";
$employeeId = $_POST["employeeId"] ?? "";
$department = $_POST["department"] ?? "";
$designation = $_POST["designation"] ?? "";
$maxMentees = $_POST["maxMentees"] ?? "";

if (
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

$photoName = "";

if (isset($_FILES["profilePhoto"]) && $_FILES["profilePhoto"]["error"] === 0) {

    $allowedTypes = ["image/jpeg", "image/png"];

    if (!in_array($_FILES["profilePhoto"]["type"], $allowedTypes)) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG and PNG images are allowed"
        ]);
        exit;
    }

    $extension = pathinfo($_FILES["profilePhoto"]["name"], PATHINFO_EXTENSION);

    $photoName = uniqid("mentor_") . "." . $extension;

    $uploadPath = "uploads/" . $photoName;

    move_uploaded_file(
        $_FILES["profilePhoto"]["tmp_name"],
        $uploadPath
    );
}

$sql = "INSERT INTO mentors 
        (mentor_name, employee_id, department, designation, max_mentees, profile_photo)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "ssssis",
    $mentorName,
    $employeeId,
    $department,
    $designation,
    $maxMentees,
    $photoName
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Mentor added successfully"
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