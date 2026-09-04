/* ==========================================================================
   MentorHub - Master Application Logic & UI Controllers (With Back Button)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

    // --- STATE MANAGEMENT ---
    let allMentors = [];
    let isBackendAvailable = true;
    let deptChartInstance = null;
    let capacityChartInstance = null;
    
    let selectedRow = null;
    let rowToDelete = null;
    let selectedMentorForStudent = null;
    let activeViewMode = "table";

    // Mock Sample Data for Demo Mode
    const mockMentors = [
        { id: 101, mentor_name: "Dr. Sarah Jenkins", employee_id: "EMP1001", department: "Computer Science", designation: "Professor", max_mentees: 5, current_mentees: 3, profile_photo: "" },
        { id: 102, mentor_name: "Prof. Marcus Vance", employee_id: "EMP1002", department: "Information Technology", designation: "Associate Professor", max_mentees: 4, current_mentees: 4, profile_photo: "" },
        { id: 103, mentor_name: "Dr. Elena Rostova", employee_id: "EMP1003", department: "Electronics", designation: "Assistant Professor", max_mentees: 6, current_mentees: 2, profile_photo: "" },
        { id: 104, mentor_name: "Prof. David Chen", employee_id: "EMP1004", department: "Mechanical", designation: "Lecturer", max_mentees: 5, current_mentees: 1, profile_photo: "" },
        { id: 105, mentor_name: "Dr. Ananya Sharma", employee_id: "EMP1005", department: "Computer Science", designation: "Professor", max_mentees: 4, current_mentees: 4, profile_photo: "" }
    ];

    const mockStudents = {
        101: [{ id: 1, student_name: "Alex Rivera", student_email: "alex.rivera@univ.edu", created_at: "2026-09-01" }, { id: 2, student_name: "Emma Watson", student_email: "emma.w@univ.edu", created_at: "2026-09-02" }, { id: 3, student_name: "Liam Neeson", student_email: "liam.n@univ.edu", created_at: "2026-09-03" }],
        102: [{ id: 4, student_name: "Sophia Loren", student_email: "sophia@univ.edu", created_at: "2026-09-01" }, { id: 5, student_name: "Noah Centineo", student_email: "noah@univ.edu", created_at: "2026-09-02" }],
        103: [{ id: 6, student_name: "Lucas Hedges", student_email: "lucas@univ.edu", created_at: "2026-09-02" }],
        104: [{ id: 7, student_name: "Olivia Rodrigo", student_email: "olivia@univ.edu", created_at: "2026-09-04" }],
        105: [{ id: 8, student_name: "Ethan Hawke", student_email: "ethan@univ.edu", created_at: "2026-09-03" }]
    };

    // --- DOM ELEMENTS ---
    const form = document.getElementById("mentorForm");
    const submitButton = document.getElementById("submitButton");
    const tableBody = document.getElementById("mentorTableBody");
    const mentorGrid = document.getElementById("mentorGrid");
    
    const editPopup = document.getElementById("editPopup");
    const deletePopup = document.getElementById("deletePopup");
    const studentPopup = document.getElementById("studentPopup");
    const viewStudentsPopup = document.getElementById("viewStudentsPopup");

    const themeToggle = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;

    const viewTableBtn = document.getElementById("viewTableBtn");
    const viewGridBtn = document.getElementById("viewGridBtn");
    const tableViewContainer = document.getElementById("tableViewContainer");
    const gridViewContainer = document.getElementById("gridViewContainer");

    const searchInput = document.getElementById("searchMentor");
    const clearSearchBtn = document.getElementById("clearSearch");
    const filterDept = document.getElementById("filterDepartment");
    const filterDesig = document.getElementById("filterDesignation");
    const filterCap = document.getElementById("filterCapacity");

    const profilePhotoInput = document.getElementById("profilePhoto");
    const photoPreviewContainer = document.getElementById("photoPreviewContainer");
    const photoPreview = document.getElementById("photoPreview");
    const fileUploadText = document.getElementById("fileUploadText");
    const dropzone = document.getElementById("dropzone");

    // --- 1. TOAST NOTIFICATIONS ---
    function showToast(message, type = "success") {
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        let icon = "✅";
        if (type === "error") icon = "⚠️";
        if (type === "info") icon = "ℹ️";

        toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            setTimeout(() => toast.remove(), 350);
        }, 3200);
    }

    // --- 2. THEME TOGGLE ---
    const savedTheme = localStorage.getItem("theme") || "light";
    htmlElement.setAttribute("data-theme", savedTheme);
    if (themeToggle) themeToggle.textContent = savedTheme === "light" ? "🌙" : "☀️";

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const currentTheme = htmlElement.getAttribute("data-theme");
            const newTheme = currentTheme === "light" ? "dark" : "light";
            htmlElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            themeToggle.textContent = newTheme === "light" ? "🌙" : "☀️";
            updateChartThemeColors();
        });
    }

    // --- 3. VIEW TOGGLE ---
    if (viewTableBtn && viewGridBtn) {
        viewTableBtn.addEventListener("click", function () {
            activeViewMode = "table";
            viewTableBtn.classList.add("active");
            viewGridBtn.classList.remove("active");
            if (tableViewContainer) tableViewContainer.style.display = "block";
            if (gridViewContainer) gridViewContainer.style.display = "none";
        });

        viewGridBtn.addEventListener("click", function () {
            activeViewMode = "grid";
            viewGridBtn.classList.add("active");
            viewTableBtn.classList.remove("active");
            if (tableViewContainer) tableViewContainer.style.display = "none";
            if (gridViewContainer) gridViewContainer.style.display = "block";
        });
    }

    // --- 4. PHOTO PREVIEW ---
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener("change", handlePhotoSelect);
    }

    function handlePhotoSelect() {
        const file = profilePhotoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (photoPreview) photoPreview.src = e.target.result;
                if (photoPreviewContainer) photoPreviewContainer.classList.add("active");
                if (fileUploadText) fileUploadText.textContent = file.name;
            };
            reader.readAsDataURL(file);
        } else {
            if (photoPreviewContainer) photoPreviewContainer.classList.remove("active");
            if (fileUploadText) fileUploadText.textContent = "Click or Drag & Drop photo here";
        }
    }

    // --- 5. FORM VALIDATION ---
    function validateForm() {
        let valid = true;
        const name = document.getElementById("mentorName");
        const employee = document.getElementById("employeeId");
        const department = document.getElementById("department");
        const designation = document.getElementById("designation");
        const mentees = document.getElementById("maxMentees");
        const photo = document.getElementById("profilePhoto");

        if (!name || name.value.trim() === "") {
            setErr("nameError", "Name is required");
            valid = false;
        } else { setErr("nameError", ""); }

        if (!employee || employee.value.trim() === "") {
            setErr("employeeError", "Employee ID is required");
            valid = false;
        } else { setErr("employeeError", ""); }

        if (!department || department.value === "") {
            setErr("departmentError", "Department is required");
            valid = false;
        } else { setErr("departmentError", ""); }

        if (!designation || designation.value === "") {
            setErr("designationError", "Designation is required");
            valid = false;
        } else { setErr("designationError", ""); }

        if (!mentees || mentees.value === "" || Number(mentees.value) <= 0) {
            setErr("menteesError", "Max mentees must be positive");
            valid = false;
        } else { setErr("menteesError", ""); }

        if (photo && photo.files.length > 0) {
            const file = photo.files[0];
            if (file.type !== "image/jpeg" && file.type !== "image/png") {
                setErr("photoError", "Only JPEG/PNG supported");
                valid = false;
            } else { setErr("photoError", ""); }
        } else { setErr("photoError", ""); }

        if (submitButton) submitButton.disabled = !valid;
        return valid;
    }

    function setErr(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    }

    if (form) {
        form.addEventListener("input", validateForm);
        form.addEventListener("change", validateForm);

        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (!validateForm()) return;

            const formData = new FormData();
            formData.append("mentorName", document.getElementById("mentorName").value.trim());
            formData.append("employeeId", document.getElementById("employeeId").value.trim());
            formData.append("department", document.getElementById("department").value);
            formData.append("designation", document.getElementById("designation").value);
            formData.append("maxMentees", document.getElementById("maxMentees").value);
            
            if (profilePhotoInput && profilePhotoInput.files.length > 0) {
                formData.append("profilePhoto", profilePhotoInput.files[0]);
            }

            if (isBackendAvailable) {
                try {
                    const response = await fetch("add_mentor.php", { method: "POST", body: formData });
                    const result = await response.json();
                    if (result.success) {
                        resetAddForm();
                        showToast("Mentor added successfully!", "success");
                        loadMentors();
                        return;
                    } else {
                        showToast(result.message || "Error adding mentor", "error");
                    }
                } catch (err) {
                    addMentorLocal();
                }
            } else {
                addMentorLocal();
            }
        });
    }

    function addMentorLocal() {
        const newMentor = {
            id: Date.now(),
            mentor_name: document.getElementById("mentorName").value.trim(),
            employee_id: document.getElementById("employeeId").value.trim(),
            department: document.getElementById("department").value,
            designation: document.getElementById("designation").value,
            max_mentees: parseInt(document.getElementById("maxMentees").value, 10) || 5,
            current_mentees: 0,
            profile_photo: ""
        };

        allMentors.unshift(newMentor);
        resetAddForm();
        showToast("Mentor added (Demo Mode)!", "success");
        filterAndRenderMentors();
        updateDashboardStats();
    }

    function resetAddForm() {
        if (form) form.reset();
        if (photoPreviewContainer) photoPreviewContainer.classList.remove("active");
        if (fileUploadText) fileUploadText.textContent = "Click or Drag & Drop photo here";
        if (submitButton) submitButton.disabled = true;
    }

    // --- 7. LOAD MENTORS ---
    async function loadMentors() {
        try {
            const response = await fetch("get_mentors.php");
            const text = await response.text();
            
            let result;
            try {
                result = JSON.parse(text);
            } catch (jsonErr) {
                throw new Error("Invalid server JSON output");
            }

            if (result && result.success && Array.isArray(result.mentors)) {
                allMentors = result.mentors;
                setDbStatus(true);
            } else {
                setDbStatus(false);
                if (allMentors.length === 0) {
                    allMentors = [...mockMentors];
                }
            }
        } catch (err) {
            setDbStatus(false);
            if (allMentors.length === 0) {
                allMentors = [...mockMentors];
            }
        }

        filterAndRenderMentors();
        updateDashboardStats();
    }

    function setDbStatus(connected) {
        isBackendAvailable = connected;
        const badge = document.getElementById("dbStatusBadge");
        const text = document.getElementById("dbStatusText");
        if (badge && text) {
            if (connected) {
                badge.className = "status-badge connected";
                text.textContent = "Live DB";
            } else {
                badge.className = "status-badge demo";
                text.textContent = "Demo Mode";
            }
        }
    }

    // --- 8. FILTER & RENDER ---
    function filterAndRenderMentors() {
        const search = (searchInput ? searchInput.value : "").toLowerCase().trim();
        const dept = filterDept ? filterDept.value : "";
        const desig = filterDesig ? filterDesig.value : "";
        const cap = filterCap ? filterCap.value : "";

        if (clearSearchBtn) {
            clearSearchBtn.classList.toggle("active", search.length > 0);
        }

        const filtered = allMentors.filter(m => {
            if (!m) return false;

            const name = (m.mentor_name || m.name || "").toString().toLowerCase();
            const empId = (m.employee_id || m.employeeId || "").toString().toLowerCase();
            const deptName = (m.department || "").toString().toLowerCase();

            const matchSearch = search === "" || 
                name.includes(search) || 
                empId.includes(search) || 
                deptName.includes(search);

            const matchDept = dept === "" || (m.department || "") === dept;
            const matchDesig = desig === "" || (m.designation || "") === desig;
            
            const curr = parseInt(m.current_mentees || 0, 10) || 0;
            const max = parseInt(m.max_mentees || 0, 10) || 0;
            const matchCap = cap === "" || 
                (cap === "available" && curr < max) || 
                (cap === "full" && curr >= max);

            return matchSearch && matchDept && matchDesig && matchCap;
        });

        const badge = document.getElementById("mentorCountBadge");
        if (badge) badge.textContent = filtered.length;

        // Render Table View
        if (tableBody) {
            tableBody.innerHTML = "";
            if (filtered.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">No mentors found matching criteria</td></tr>`;
            } else {
                filtered.forEach(mentor => {
                    const tr = createMentorRow(mentor);
                    tableBody.appendChild(tr);
                });
            }
        }

        // Render Grid View
        if (mentorGrid) {
            mentorGrid.innerHTML = "";
            if (filtered.length === 0) {
                mentorGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">No mentors found matching criteria</div>`;
            } else {
                filtered.forEach(mentor => {
                    const card = createMentorGridCard(mentor);
                    mentorGrid.appendChild(card);
                });
            }
        }
    }

    if (searchInput) searchInput.addEventListener("input", filterAndRenderMentors);
    if (filterDept) filterDept.addEventListener("change", filterAndRenderMentors);
    if (filterDesig) filterDesig.addEventListener("change", filterAndRenderMentors);
    if (filterCap) filterCap.addEventListener("change", filterAndRenderMentors);

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", function () {
            if (searchInput) searchInput.value = "";
            filterAndRenderMentors();
        });
    }

    // --- 9. RENDER ROW ---
    function createMentorRow(mentor) {
        const tr = document.createElement("tr");
        tr.dataset.id = mentor.id || "";

        const current = parseInt(mentor.current_mentees || 0, 10) || 0;
        const max = parseInt(mentor.max_mentees || 0, 10) || 0;
        const isFull = current >= max && max > 0;

        let photoHTML = `<div class="stat-icon" style="width:40px;height:40px;font-size:18px;">👤</div>`;
        if (mentor.profile_photo) {
            photoHTML = `<img src="uploads/${escapeHTML(mentor.profile_photo)}" class="photo-avatar" alt="${escapeHTML(mentor.mentor_name)}">`;
        }

        tr.innerHTML = `
            <td>
                <div class="mentor-name-cell">
                    <span class="mentor-name-text">${escapeHTML(mentor.mentor_name)}</span>
                    <span class="mentor-designation-sub">${escapeHTML(mentor.designation)}</span>
                </div>
            </td>
            <td><code>${escapeHTML(mentor.employee_id)}</code></td>
            <td><span class="badge" style="background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border-color);">${escapeHTML(mentor.department)}</span></td>
            <td><strong>${max}</strong></td>
            <td>
                <span class="mentee-count-badge ${isFull ? 'full' : 'available'}">
                    ${isFull ? '🔴 Full' : '🟢 Available'} (${current}/${max})
                </span>
            </td>
            <td>${photoHTML}</td>
            <td>
                <div class="action-buttons-group">
                    <button type="button" class="edit-btn">✏️ Edit</button>
                    <button type="button" class="student-btn">➕ Mentee</button>
                    <button type="button" class="view-students-btn">📜 View (${current})</button>
                    <button type="button" class="download-btn" title="Export CSV for this mentor & students">📥 CSV</button>
                    <button type="button" class="delete-btn">🗑️</button>
                </div>
            </td>
        `;

        bindRowEvents(tr, mentor);
        return tr;
    }

    // --- 10. RENDER GRID CARD ---
    function createMentorGridCard(mentor) {
        const card = document.createElement("div");
        card.className = "mentor-card-item";
        card.dataset.id = mentor.id || "";

        const current = parseInt(mentor.current_mentees || 0, 10) || 0;
        const max = parseInt(mentor.max_mentees || 0, 10) || 0;
        const isFull = current >= max && max > 0;

        let photoHTML = `<div class="stat-icon" style="width:46px;height:46px;font-size:20px;">👤</div>`;
        if (mentor.profile_photo) {
            photoHTML = `<img src="uploads/${escapeHTML(mentor.profile_photo)}" class="photo-avatar" style="width:46px;height:46px;" alt="${escapeHTML(mentor.mentor_name)}">`;
        }

        card.innerHTML = `
            <div class="mentor-card-header">
                ${photoHTML}
                <div class="mentor-card-info">
                    <h3>${escapeHTML(mentor.mentor_name)}</h3>
                    <p>${escapeHTML(mentor.designation)}</p>
                </div>
            </div>
            
            <div class="mentor-card-details">
                <div class="detail-row">
                    <span class="detail-label">Employee ID:</span>
                    <span class="detail-value">${escapeHTML(mentor.employee_id)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${escapeHTML(mentor.department)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Capacity Status:</span>
                    <span class="mentee-count-badge ${isFull ? 'full' : 'available'}">${current}/${max} assigned</span>
                </div>
            </div>

            <div class="action-buttons-group" style="justify-content: flex-end; margin-top: auto; flex-wrap: wrap;">
                <button type="button" class="edit-btn">✏️ Edit</button>
                <button type="button" class="student-btn">➕ Mentee</button>
                <button type="button" class="view-students-btn">📜 View (${current})</button>
                <button type="button" class="download-btn" title="Export CSV for this mentor & students">📥 CSV</button>
                <button type="button" class="delete-btn">🗑️</button>
            </div>
        `;

        bindRowEvents(card, mentor);
        return card;
    }

    function bindRowEvents(element, mentor) {
        const editBtn = element.querySelector(".edit-btn");
        const deleteBtn = element.querySelector(".delete-btn");
        const studentBtn = element.querySelector(".student-btn");
        const viewStudentsBtn = element.querySelector(".view-students-btn");
        const downloadBtn = element.querySelector(".download-btn");

        if (editBtn) {
            editBtn.addEventListener("click", () => {
                selectedRow = element;
                document.getElementById("editName").value = mentor.mentor_name || "";
                document.getElementById("editEmployeeId").value = mentor.employee_id || "";
                document.getElementById("editDepartment").value = mentor.department || "";
                document.getElementById("editDesignation").value = mentor.designation || "";
                document.getElementById("editMaxMentees").value = mentor.max_mentees || "";
                if (editPopup) editPopup.showModal();
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                rowToDelete = mentor;
                if (deletePopup) deletePopup.showModal();
            });
        }

        if (studentBtn) {
            studentBtn.addEventListener("click", () => {
                selectedMentorForStudent = mentor.id;
                const current = parseInt(mentor.current_mentees || 0, 10) || 0;
                const lbl = document.getElementById("mentorCapacityLabel");
                if (lbl) {
                    lbl.textContent = `${mentor.mentor_name} (${current}/${mentor.max_mentees} mentees assigned)`;
                }
                document.getElementById("studentName").value = "";
                document.getElementById("studentEmail").value = "";
                if (studentPopup) studentPopup.showModal();
            });
        }

        if (viewStudentsBtn) {
            viewStudentsBtn.addEventListener("click", () => {
                openViewStudentsPopup(mentor);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                exportSingleMentorCsv(mentor);
            });
        }
    }

    // --- 11. INDIVIDUAL MENTOR CSV ---
    function exportSingleMentorCsv(mentor) {
        if (isBackendAvailable) {
            window.location.href = `export_mentor_csv.php?id=${mentor.id}`;
        } else {
            const students = mockStudents[mentor.id] || [];
            let csv = "MENTOR DETAILS REPORT\n";
            csv += `Mentor Name,"${mentor.mentor_name}"\n`;
            csv += `Employee ID,"${mentor.employee_id}"\n`;
            csv += `Department,"${mentor.department}"\n`;
            csv += `Designation,"${mentor.designation}"\n`;
            csv += `Max Capacity,${mentor.max_mentees}\n`;
            csv += `Current Mentees,${students.length}\n\n`;

            csv += "ASSIGNED STUDENTS LIST\n";
            csv += "Student ID,Student Name,Student Email\n";
            if (students.length === 0) {
                csv += "N/A,No students assigned,N/A\n";
            } else {
                students.forEach(s => {
                    csv += `${s.id},"${s.student_name}","${s.student_email}"\n`;
                });
            }

            downloadCsvFile(csv, `mentor_${mentor.employee_id}_report.csv`);
            showToast(`Exported CSV for ${mentor.mentor_name}`, "info");
        }
    }

    // --- 12. VIEW ASSIGNED MENTEES ---
    async function openViewStudentsPopup(mentor) {
        const titleEl = document.getElementById("viewStudentsMentorTitle");
        if (titleEl) titleEl.textContent = `Assigned Mentees for ${mentor.mentor_name}`;
        
        const container = document.getElementById("studentsListContainer");
        if (container) container.innerHTML = `<div class="loading-spinner">Loading mentees...</div>`;
        if (viewStudentsPopup) viewStudentsPopup.showModal();

        if (isBackendAvailable) {
            try {
                const response = await fetch(`get_students_list.php?mentor_id=${mentor.id}`);
                const result = await response.json();
                if (result.success) {
                    renderStudentsList(result.students, mentor.id);
                } else {
                    if (container) container.innerHTML = `<p style="color:var(--danger);">${result.message}</p>`;
                }
            } catch (err) {
                renderStudentsList(mockStudents[mentor.id] || [], mentor.id);
            }
        } else {
            renderStudentsList(mockStudents[mentor.id] || [], mentor.id);
        }
    }

    function renderStudentsList(students, mentorId) {
        const container = document.getElementById("studentsListContainer");
        if (!container) return;
        container.innerHTML = "";

        if (!students || students.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px;">No mentees assigned yet.</p>`;
            return;
        }

        students.forEach(st => {
            const div = document.createElement("div");
            div.className = "student-item";
            div.innerHTML = `
                <div class="student-info">
                    <h4>${escapeHTML(st.student_name)}</h4>
                    <p>✉️ ${escapeHTML(st.student_email)}</p>
                </div>
                <button type="button" class="delete-btn" style="padding:4px 8px;" title="Unassign Student">Remove</button>
            `;

            div.querySelector(".delete-btn").addEventListener("click", async () => {
                if (isBackendAvailable) {
                    try {
                        const fd = new FormData();
                        fd.append("id", st.id);
                        await fetch("delete_student.php", { method: "POST", body: fd });
                    } catch (e) {}
                }

                if (mockStudents[mentorId]) {
                    mockStudents[mentorId] = mockStudents[mentorId].filter(s => s.id !== st.id);
                }

                const m = allMentors.find(x => x.id == mentorId);
                if (m && m.current_mentees > 0) m.current_mentees--;

                showToast("Student mentee removed", "info");
                renderStudentsList(mockStudents[mentorId] || [], mentorId);
                filterAndRenderMentors();
                updateDashboardStats();
            });

            container.appendChild(div);
        });
    }

    // --- 13. EDIT FORM SUBMIT ---
    const editForm = document.getElementById("editForm");
    if (editForm) {
        editForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const id = selectedRow ? selectedRow.dataset.id : null;
            const name = document.getElementById("editName").value.trim();
            const employee = document.getElementById("editEmployeeId").value.trim();
            const department = document.getElementById("editDepartment").value;
            const designation = document.getElementById("editDesignation").value;
            const mentees = document.getElementById("editMaxMentees").value;

            if (!id || !name || !employee || !department || !designation || !mentees) {
                showToast("All fields are required", "error");
                return;
            }

            const formData = new FormData();
            formData.append("id", id);
            formData.append("mentorName", name);
            formData.append("employeeId", employee);
            formData.append("department", department);
            formData.append("designation", designation);
            formData.append("maxMentees", mentees);

            const editPhoto = document.getElementById("editPhoto");
            if (editPhoto && editPhoto.files.length > 0) {
                formData.append("profilePhoto", editPhoto.files[0]);
            }

            if (isBackendAvailable) {
                try {
                    const response = await fetch("update_mentor.php", { method: "POST", body: formData });
                    const result = await response.json();
                    if (result.success) {
                        if (editPopup) editPopup.close();
                        showToast("Mentor updated successfully!", "success");
                        loadMentors();
                        return;
                    }
                } catch (err) {}
            }

            const target = allMentors.find(m => m.id == id);
            if (target) {
                target.mentor_name = name;
                target.employee_id = employee;
                target.department = department;
                target.designation = designation;
                target.max_mentees = parseInt(mentees, 10);
            }
            if (editPopup) editPopup.close();
            showToast("Mentor updated!", "success");
            filterAndRenderMentors();
            updateDashboardStats();
        });
    }

    // --- 14. DELETE MENTOR ---
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async function () {
            if (!rowToDelete) return;
            const id = rowToDelete.id;

            if (isBackendAvailable) {
                try {
                    const fd = new FormData();
                    fd.append("id", id);
                    await fetch("delete_mentor.php", { method: "POST", body: fd });
                    if (deletePopup) deletePopup.close();
                    showToast("Mentor deleted!", "info");
                    loadMentors();
                    return;
                } catch (err) {}
            }

            allMentors = allMentors.filter(m => m.id != id);
            if (deletePopup) deletePopup.close();
            showToast("Mentor deleted!", "info");
            filterAndRenderMentors();
            updateDashboardStats();
        });
    }

    // --- 15. ADD STUDENT SUBMIT ---
    const studentForm = document.getElementById("studentForm");
    if (studentForm) {
        studentForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const studentName = document.getElementById("studentName").value.trim();
            const studentEmail = document.getElementById("studentEmail").value.trim();

            if (!studentName || !studentEmail || !studentEmail.includes("@")) {
                showToast("Valid name & email required", "error");
                return;
            }

            const formData = new FormData();
            formData.append("mentor_id", selectedMentorForStudent);
            formData.append("student_name", studentName);
            formData.append("student_email", studentEmail);

            if (isBackendAvailable) {
                try {
                    const res = await fetch("add_student.php", { method: "POST", body: formData });
                    const json = await res.json();
                    if (json.success) {
                        if (studentPopup) studentPopup.close();
                        showToast("Student mentee assigned!", "success");
                        loadMentors();
                        return;
                    } else {
                        showToast(json.message || "Failed to add student", "error");
                    }
                } catch (err) {}
            }

            if (!mockStudents[selectedMentorForStudent]) mockStudents[selectedMentorForStudent] = [];
            mockStudents[selectedMentorForStudent].push({
                id: Date.now(),
                student_name: studentName,
                student_email: studentEmail
            });

            const target = allMentors.find(m => m.id == selectedMentorForStudent);
            if (target) {
                target.current_mentees = (target.current_mentees || 0) + 1;
            }

            if (studentPopup) studentPopup.close();
            showToast("Student mentee assigned!", "success");
            filterAndRenderMentors();
            updateDashboardStats();
        });
    }

    // --- 16. EXPORT SUMMARY CSV ---
    const downloadMentorsCsvBtn = document.getElementById("downloadMentorsCsv");
    if (downloadMentorsCsvBtn) {
        downloadMentorsCsvBtn.addEventListener("click", function () {
            if (isBackendAvailable) {
                window.location.href = "export_csv.php";
            } else {
                let csv = "ID,Mentor Name,Employee ID,Department,Designation,Max Capacity,Current Mentees\n";
                allMentors.forEach(m => {
                    csv += `${m.id},"${m.mentor_name}","${m.employee_id}","${m.department}","${m.designation}",${m.max_mentees},${m.current_mentees || 0}\n`;
                });
                downloadCsvFile(csv, "all_mentors_summary.csv");
                showToast("Exported All Mentors Summary CSV", "info");
            }
        });
    }

    // --- 17. EXPORT FULL COLORFUL PDF REPORT ---
    const downloadFullReportPdfBtn = document.getElementById("downloadFullReportPdf");
    if (downloadFullReportPdfBtn) {
        downloadFullReportPdfBtn.addEventListener("click", function () {
            if (isBackendAvailable) {
                window.open("export_full_report_pdf.php", "_blank");
                showToast("Opening Full PDF Report Print View...", "info");
            } else {
                generateDemoPdfReport();
            }
        });
    }

    function generateDemoPdfReport() {
        const printWin = window.open("", "_blank");
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>MentorHub - Full Mentorship Report (PDF)</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F8FAFC; color: #0F172A; padding: 30px; }
                .report-header { background: linear-gradient(135deg, #0F172A, #1E293B); color: white; padding: 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .brand-group { display: flex; align-items: center; gap: 14px; }
                .brand-logo { font-size: 30px; background: linear-gradient(135deg, #2563EB, #1D4ED8); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
                .mentor-card { background: white; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 20px; }
                .mentor-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 10px; margin-bottom: 12px; }
                .mentor-dept { background: #E0F2FE; color: #0369A1; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                .mentor-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #F8FAFC; padding: 10px; border-radius: 8px; margin-bottom: 12px; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
                th { background: #F1F5F9; color: #475569; padding: 8px; text-align: left; }
                td { padding: 8px; border-bottom: 1px solid #E2E8F0; }
                .empty-msg { background: #FEF2F2; color: #991B1B; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 12px 20px; border-radius: 12px;">
                <span style="font-size:13px; font-weight:600;">📄 Official Mentorship PDF Report - Ready for Print / Export</span>
                <div style="display:flex; gap:10px;">
                    <a href="index.html" style="background:#475569; color:white; text-decoration:none; padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">⬅️ Back to Portal</a>
                    <button onclick="window.print()" style="background:#2563EB; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;">📥 Print / Save as PDF</button>
                </div>
            </div>

            <div class="report-header">
                <div class="brand-group">
                    <div class="brand-logo">🎓</div>
                    <div>
                        <h1 style="font-size:22px;">MentorHub</h1>
                        <p style="font-size:12px; opacity:0.8;">Academic Mentorship Management Portal</p>
                    </div>
                </div>
                <div style="text-align:right; font-size:12px;">
                    <strong style="font-size:14px; color:#60A5FA;">OFFICIAL MENTORSHIP REPORT</strong>
                    <div>Generated: ${new Date().toLocaleString()}</div>
                </div>
            </div>
        `;

        allMentors.forEach(m => {
            const stList = mockStudents[m.id] || [];
            html += `
            <div class="mentor-card">
                <div class="mentor-header">
                    <div>
                        <h3 style="font-size:16px;">${escapeHTML(m.mentor_name)}</h3>
                        <p style="font-size:12px; color:#64748B;">${escapeHTML(m.designation)}</p>
                    </div>
                    <span class="mentor-dept">${escapeHTML(m.department)}</span>
                </div>
                <div class="mentor-details-grid">
                    <div><span style="color:#64748B;">EMPLOYEE ID</span><br><strong>${escapeHTML(m.employee_id)}</strong></div>
                    <div><span style="color:#64748B;">DEPARTMENT</span><br><strong>${escapeHTML(m.department)}</strong></div>
                    <div><span style="color:#64748B;">MAX CAPACITY</span><br><strong>${m.max_mentees} Students</strong></div>
                    <div><span style="color:#64748B;">ASSIGNED MENTEES</span><br><strong>${stList.length} / ${m.max_mentees}</strong></div>
                </div>
                <div>
                    <h4 style="font-size:13px; margin-bottom:6px;">Assigned Mentees List (${stList.length})</h4>
            `;

            if (stList.length === 0) {
                html += `<div class="empty-msg">No students currently assigned to this mentor.</div>`;
            } else {
                html += `
                <table>
                    <thead>
                        <tr><th>#</th><th>Student Name</th><th>Email Address</th><th>Assigned Date</th></tr>
                    </thead>
                    <tbody>
                `;
                stList.forEach((st, idx) => {
                    html += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><strong>${escapeHTML(st.student_name)}</strong></td>
                        <td>${escapeHTML(st.student_email)}</td>
                        <td>${st.created_at || 'Recent'}</td>
                    </tr>
                    `;
                });
                html += `</tbody></table>`;
            }

            html += `</div></div>`;
        });

        html += `<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script></body></html>`;
        
        printWin.document.write(html);
        printWin.document.close();
        showToast("Generated Full PDF Report", "info");
    }

    function downloadCsvFile(content, filename) {
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- 18. DASHBOARD STATS & DUAL CHARTS ---
    function updateDashboardStats() {
        const totalMentors = allMentors.length;
        let totalStudents = 0;
        let totalCapacity = 0;
        let atCapacityCount = 0;

        const deptCounts = {};
        const deptCapacities = {};
        const deptAssigned = {};

        allMentors.forEach(m => {
            if (!m) return;
            const curr = parseInt(m.current_mentees || 0, 10) || 0;
            const max = parseInt(m.max_mentees || 0, 10) || 0;
            totalStudents += curr;
            totalCapacity += max;

            if (curr >= max && max > 0) atCapacityCount++;

            const d = m.department || "General";
            deptCounts[d] = (deptCounts[d] || 0) + 1;
            deptCapacities[d] = (deptCapacities[d] || 0) + max;
            deptAssigned[d] = (deptAssigned[d] || 0) + curr;
        });

        const availableCount = totalMentors - atCapacityCount;
        const avgStudents = totalMentors > 0 ? (totalStudents / totalMentors).toFixed(1) : 0;
        const capacityUtil = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

        animateCounter("totalMentorsStat", totalMentors);
        animateCounter("totalStudentsStat", totalStudents);
        
        const avgEl = document.getElementById("avgStudentsStat");
        if (avgEl) avgEl.textContent = avgStudents;

        const utilEl = document.getElementById("capacityUtilStat");
        if (utilEl) utilEl.textContent = `${capacityUtil}%`;

        // Progress bars
        const availPct = totalMentors > 0 ? (availableCount / totalMentors) * 100 : 0;
        const fullPct = totalMentors > 0 ? (atCapacityCount / totalMentors) * 100 : 0;

        const availBar = document.getElementById("availableBar");
        if (availBar) availBar.style.width = `${availPct}%`;

        const fullBar = document.getElementById("fullBar");
        if (fullBar) fullBar.style.width = `${fullPct}%`;

        const availCnt = document.getElementById("availableCount");
        if (availCnt) availCnt.textContent = availableCount;

        const fullCnt = document.getElementById("fullCount");
        if (fullCnt) fullCnt.textContent = atCapacityCount;

        renderDepartmentDoughnutChart(deptCounts);
        renderCapacityBarChart(deptCapacities, deptAssigned);
    }

    function animateCounter(id, targetValue) {
        const el = document.getElementById(id);
        if (!el) return;
        const startValue = parseInt(el.textContent, 10) || 0;
        if (startValue === targetValue) return;

        const duration = 500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            el.textContent = Math.floor(startValue + (targetValue - startValue) * progress);
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = targetValue;
        }
        requestAnimationFrame(update);
    }

    function renderDepartmentDoughnutChart(deptCounts) {
        const canvas = document.getElementById("deptChart");
        if (!canvas) return;

        const labels = Object.keys(deptCounts);
        const data = Object.values(deptCounts);

        if (deptChartInstance) deptChartInstance.destroy();

        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

        deptChartInstance = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: labels.length ? colors.slice(0, labels.length) : ['#CBD5E1'],
                    borderWidth: 2,
                    borderColor: htmlElement.getAttribute("data-theme") === "dark" ? "#1E293B" : "#FFFFFF"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: htmlElement.getAttribute("data-theme") === "dark" ? "#CBD5E1" : "#475569",
                            font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
                            padding: 8,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '68%',
                animation: { animateScale: true }
            }
        });
    }

    function renderCapacityBarChart(deptCapacities, deptAssigned) {
        const canvas = document.getElementById("capacityChart");
        if (!canvas) return;

        const labels = Object.keys(deptCapacities);
        const assignedData = labels.map(l => deptAssigned[l] || 0);
        const capacityData = labels.map(l => deptCapacities[l] || 0);

        if (capacityChartInstance) capacityChartInstance.destroy();

        const textColor = htmlElement.getAttribute("data-theme") === "dark" ? "#CBD5E1" : "#475569";
        const gridColor = htmlElement.getAttribute("data-theme") === "dark" ? "#334155" : "#E2E8F0";

        capacityChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [
                    {
                        label: 'Assigned Mentees',
                        data: assignedData.length ? assignedData : [0],
                        backgroundColor: '#3B82F6',
                        borderRadius: 6
                    },
                    {
                        label: 'Total Capacity',
                        data: capacityData.length ? capacityData : [0],
                        backgroundColor: '#CBD5E1',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
                            padding: 8,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: textColor, font: { size: 10 }, stepSize: 2 }, grid: { color: gridColor } }
                }
            }
        });
    }

    function updateChartThemeColors() {
        const textColor = htmlElement.getAttribute("data-theme") === "dark" ? "#CBD5E1" : "#475569";
        const borderColor = htmlElement.getAttribute("data-theme") === "dark" ? "#1E293B" : "#FFFFFF";

        if (deptChartInstance) {
            deptChartInstance.options.plugins.legend.labels.color = textColor;
            deptChartInstance.data.datasets[0].borderColor = borderColor;
            deptChartInstance.update();
        }

        if (capacityChartInstance) {
            capacityChartInstance.options.plugins.legend.labels.color = textColor;
            capacityChartInstance.options.scales.x.ticks.color = textColor;
            capacityChartInstance.options.scales.y.ticks.color = textColor;
            capacityChartInstance.update();
        }
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    validateForm();
    loadMentors();

});