<?php

include "db.php";

// Fetch all mentors with current mentees count
$sql = "SELECT m.*, COALESCE(COUNT(s.id), 0) as current_mentees
        FROM mentors m
        LEFT JOIN students s ON m.id = s.mentor_id
        GROUP BY m.id
        ORDER BY m.id DESC";

$result = $conn->query($sql);
$mentors = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $mentor_id = $row['id'];
        
        // Fetch assigned students for this mentor
        $studentSql = "SELECT id, student_name, student_email, created_at FROM students WHERE mentor_id = ? ORDER BY id ASC";
        $stmt = $conn->prepare($studentSql);
        $stmt->bind_param("i", $mentor_id);
        $stmt->execute();
        $stResult = $stmt->get_result();
        
        $students = [];
        while ($stRow = $stResult->fetch_assoc()) {
            $students[] = $stRow;
        }
        $stmt->close();
        
        $row['students'] = $students;
        $mentors[] = $row;
    }
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MentorHub - Full Mentorship Report (PDF)</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #F8FAFC;
            color: #0F172A;
            padding: 30px;
            line-height: 1.5;
        }

        .report-header {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            color: white;
            padding: 24px 30px;
            border-radius: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .brand-group {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .brand-logo {
            font-size: 32px;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
        }

        .brand-title h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .brand-title p {
            font-size: 12px;
            color: #94A3B8;
        }

        .report-meta {
            text-align: right;
            font-size: 12px;
            color: #CBD5E1;
        }

        .report-meta strong {
            color: #60A5FA;
            font-size: 14px;
            display: block;
        }

        .no-print-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: #EFF6FF;
            border: 1px solid #BFDBFE;
            padding: 12px 20px;
            border-radius: 12px;
        }

        .action-btns-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .back-btn {
            background: #475569;
            color: white;
            text-decoration: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s ease;
        }

        .back-btn:hover {
            background: #334155;
        }

        .print-btn {
            background: #2563EB;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s ease;
        }

        .print-btn:hover {
            background: #1D4ED8;
        }

        .mentor-card {
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
            page-break-inside: avoid;
        }

        .mentor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #F1F5F9;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }

        .mentor-name {
            font-size: 17px;
            font-weight: 800;
            color: #0F172A;
        }

        .mentor-dept {
            background: #E0F2FE;
            color: #0369A1;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
        }

        .mentor-details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            background: #F8FAFC;
            padding: 10px 14px;
            border-radius: 10px;
            margin-bottom: 14px;
            font-size: 12px;
        }

        .detail-item span {
            color: #64748B;
            display: block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .detail-item strong {
            font-size: 13px;
            color: #0F172A;
        }

        .students-section h4 {
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #334155;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        th {
            background: #F1F5F9;
            color: #475569;
            text-align: left;
            padding: 8px 12px;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
        }

        td {
            padding: 8px 12px;
            border-bottom: 1px solid #E2E8F0;
            color: #1E293B;
        }

        .empty-mentees {
            background: #FEF2F2;
            color: #991B1B;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        }

        @media print {
            body { background: white; padding: 0; }
            .no-print-bar { display: none; }
            .report-header { box-shadow: none; }
            .mentor-card { box-shadow: none; border: 1px solid #CBD5E1; }
        }
    </style>
</head>
<body>

    <div class="no-print-bar">
        <span>📄 Official Mentorship PDF Report - Ready for Print / Export</span>
        <div class="action-btns-group">
            <a href="index.html" class="back-btn">⬅️ Back to Portal</a>
            <button class="print-btn" onclick="window.print()">📥 Print / Save as PDF</button>
        </div>
    </div>

    <div class="report-header">
        <div class="brand-group">
            <div class="brand-logo">🎓</div>
            <div class="brand-title">
                <h1>MentorHub</h1>
                <p>Academic Mentorship Management Portal</p>
            </div>
        </div>
        <div class="report-meta">
            <strong>OFFICIAL MENTORSHIP REPORT</strong>
            <span>Generated Date: <?php echo date('F j, Y, g:i a'); ?></span>
        </div>
    </div>

    <?php if (empty($mentors)): ?>
        <div class="empty-mentees">No mentor records found.</div>
    <?php else: ?>
        <?php foreach ($mentors as $mentor): ?>
            <div class="mentor-card">
                <div class="mentor-header">
                    <div>
                        <div class="mentor-name"><?php echo htmlspecialchars($mentor['mentor_name']); ?></div>
                        <div style="font-size: 12px; color: #64748B;"><?php echo htmlspecialchars($mentor['designation']); ?></div>
                    </div>
                    <div class="mentor-dept"><?php echo htmlspecialchars($mentor['department']); ?></div>
                </div>

                <div class="mentor-details-grid">
                    <div class="detail-item">
                        <span>Employee ID</span>
                        <strong><?php echo htmlspecialchars($mentor['employee_id']); ?></strong>
                    </div>
                    <div class="detail-item">
                        <span>Department</span>
                        <strong><?php echo htmlspecialchars($mentor['department']); ?></strong>
                    </div>
                    <div class="detail-item">
                        <span>Max Capacity</span>
                        <strong><?php echo htmlspecialchars($mentor['max_mentees']); ?> Students</strong>
                    </div>
                    <div class="detail-item">
                        <span>Assigned Mentees</span>
                        <strong><?php echo count($mentor['students']); ?> / <?php echo htmlspecialchars($mentor['max_mentees']); ?></strong>
                    </div>
                </div>

                <div class="students-section">
                    <h4>Assigned Mentees List (<?php echo count($mentor['students']); ?>)</h4>
                    <?php if (empty($mentor['students'])): ?>
                        <div class="empty-mentees">No students currently assigned to this mentor.</div>
                    <?php else: ?>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>Email Address</th>
                                    <th>Assigned Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($mentor['students'] as $index => $st): ?>
                                    <tr>
                                        <td><?php echo $index + 1; ?></td>
                                        <td><strong><?php echo htmlspecialchars($st['student_name']); ?></strong></td>
                                        <td><?php echo htmlspecialchars($st['student_email']); ?></td>
                                        <td><?php echo date('M d, Y', strtotime($st['created_at'])); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>

    <script>
        // Auto trigger print when page loads
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
