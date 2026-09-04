<?php

header("Content-Type: text/csv; charset=utf-8");
header("Content-Disposition: attachment; filename=mentors_" . date('Y-m-d') . ".csv");

include "db.php";

// Get all mentors with mentee count
$sql = "SELECT m.id, m.mentor_name, m.employee_id, m.department, m.designation, m.max_mentees,
        COUNT(s.id) as current_mentees
        FROM mentors m
        LEFT JOIN students s ON m.id = s.mentor_id
        GROUP BY m.id
        ORDER BY m.id DESC";

$result = $conn->query($sql);

if (!$result) {
    die("Query failed: " . $conn->error);
}

// Create CSV output
$output = fopen("php://output", "w");

// Add header row
fputcsv($output, ["ID", "Mentor Name", "Employee ID", "Department", "Designation", "Max Mentees", "Current Mentees"]);

// Add data rows
while ($row = $result->fetch_assoc()) {
    fputcsv($output, [
        $row['id'],
        $row['mentor_name'],
        $row['employee_id'],
        $row['department'],
        $row['designation'],
        $row['max_mentees'],
        $row['current_mentees']
    ]);
}

fclose($output);
$conn->close();

?>
