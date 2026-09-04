<?php

header("Content-Type: text/csv; charset=utf-8");
header("Content-Disposition: attachment; filename=mentors_and_students_report_" . date('Y-m-d') . ".csv");

include "db.php";

$sql = "SELECT m.id as mentor_id, m.mentor_name, m.employee_id, m.department, m.designation, m.max_mentees,
        s.id as student_id, s.student_name, s.student_email, s.created_at as student_added_date
        FROM mentors m
        LEFT JOIN students s ON m.id = s.mentor_id
        ORDER BY m.id DESC, s.id ASC";

$result = $conn->query($sql);

$output = fopen("php://output", "w");

fputcsv($output, ["FULL MENTORSHIP REPORT (MENTORS & ASSIGNED STUDENTS)"]);
fputcsv($output, ["Generated Date", date('Y-m-d H:i:s')]);
fputcsv($output, []);

fputcsv($output, [
    "Mentor ID", 
    "Mentor Name", 
    "Employee ID", 
    "Department", 
    "Designation", 
    "Max Capacity", 
    "Student ID", 
    "Student Name", 
    "Student Email", 
    "Student Assignment Date"
]);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        fputcsv($output, [
            $row['mentor_id'],
            $row['mentor_name'],
            $row['employee_id'],
            $row['department'],
            $row['designation'],
            $row['max_mentees'],
            $row['student_id'] ? $row['student_id'] : "N/A",
            $row['student_name'] ? $row['student_name'] : "No Students Assigned",
            $row['student_email'] ? $row['student_email'] : "-",
            $row['student_added_date'] ? $row['student_added_date'] : "-"
        ]);
    }
} else {
    fputcsv($output, ["No data available"]);
}

fclose($output);
$conn->close();

?>
