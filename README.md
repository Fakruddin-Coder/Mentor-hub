# 🎓 MentorHub - Mentor & Mentee Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mentorhub2026.site.je-4f46e5?style=for-the-badge&logo=googlechrome&logoColor=white)](https://mentorhub2026.site.je/)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479a1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

**MentorHub** is a modern, responsive web application designed for educational institutions and organizations to efficiently manage mentors, assign mentees (students), monitor capacity limits, and generate colorful PDF and CSV analytics reports.

🌐 **Live Demo:** [https://mentorhub2026.site.je/](https://mentorhub2026.site.je/)

---

## ✨ Key Features

- 📊 **Interactive Dashboard Analytics**: Real-time stats for total mentors, active mentees, available capacity, and top departments.
- 👨‍🏫 **Comprehensive Mentor Directory**: Toggle between responsive Grid Card View and structured Table View with search and department filtering.
- 🎓 **Dynamic Mentee Allocation System**: Easily assign students to mentors with real-time capacity checks (`max_mentees`).
- 📚 **Mentorship Activities Cards**: Quick-reference guide featuring 8 core activities (Problem Solving, Book Reading, Video Learning, Discussions, Assignments, Goal Setting, Presentations, Group Work).
- 📄 **Export Capabilities**:
  - Download all mentors list as **CSV**.
  - Download individual mentor + assigned mentees as **CSV**.
  - Generate & Print **Official Colorful PDF Reports** with institute branding.
- 🌗 **Light & Dark Theme**: Glassmorphic UI with persistent dark mode toggle.
- 📸 **Profile Photo Uploads**: Drag-and-drop photo upload with instant image preview.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla Glassmorphism Design System), JavaScript (ES6, Fetch API)
- **Backend**: PHP 8.x
- **Database**: MySQL / MariaDB (InnoDB, UTF-8)
- **Icons & Fonts**: FontAwesome 6, Google Fonts (*Plus Jakarta Sans*)

---

## 📁 Repository Structure

```text
mentor-management/
├── index.html                  # Main Dashboard Single Page Application
├── style.css                   # Glassmorphism Styling & Dark Mode Tokens
├── script.js                   # Application Logic, Modal Controls & AJAX
├── db.php                      # MySQL Database Connection Script
├── setup.sql                   # Database Schema & Initial Seed Data
├── get_dashboard.php           # Analytics Summary Endpoint
├── get_mentors.php             # Mentors List Endpoint
├── get_mentor_details.php      # Mentor Profile & Assigned Students Endpoint
├── add_mentor.php              # Create Mentor API
├── update_mentor.php           # Edit Mentor API
├── delete_mentor.php           # Delete Mentor API
├── add_student.php             # Assign Student API
├── update_student.php          # Edit Student API
├── delete_student.php          # Remove Student API
├── export_csv.php              # Export Mentors CSV
├── export_mentor_csv.php       # Export Individual Mentor CSV
├── export_full_report_csv.php  # Export Full System CSV
├── export_full_report_pdf.php  # Printable Official PDF Report Generator
└── uploads/                    # Profile Photo Upload Directory
```

---

## 🚀 Local Installation & Setup

Follow these steps to run **MentorHub** locally on XAMPP / WAMP / LAMP:

### 1. Prerequisites
- [XAMPP](https://www.apachefriends.org/) (PHP 7.4+ or 8.x, MySQL Server)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/Fakruddin-Coder/Mentor-hub.git
cd Mentor-hub
```
*(Or place the project files inside `C:/xampp/htdocs/mentor-management`)*

### 3. Setup the Database
1. Open XAMPP Control Panel and start **Apache** & **MySQL**.
2. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin) in your browser.
3. Create a new database named `mentor_management`.
4. Select `mentor_management` and click **Import**.
5. Choose the [`setup.sql`](setup.sql) file from the project folder and click **Go**.

### 4. Configure Database Connection
Check [`db.php`](db.php) to match your local XAMPP database credentials:
```php
$host     = "localhost";
$username = "root";
$password = "";
$database = "mentor_management";
```

### 5. Launch Application
Open your browser and visit:
```text
http://localhost/mentor-management/
```

---

## 🌐 Live Deployment Link

The project is deployed and live at:
**[https://mentorhub2026.site.je/](https://mentorhub2026.site.je/)**

---

## 📝 License

Distributed under the MIT License.
