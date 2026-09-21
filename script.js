const STORAGE_KEY = "detlof_bulk_import_codes";
let activeStudent = null;

const DEFAULT_STUDENTS = [
  {
    fullName: "Eliana Ama Owusu",
    email: "eliana.owusu@detlof.edu.gh",
    studentId: "DPS-24-0187",
    currentClass: "JHS 2",
    academicYear: "2024 / 2025",
    loginCode: "Detlof2025!",
  },
  {
    fullName: "Abena Osei",
    email: "abena.osei@detlof.edu.gh",
    studentId: "DPS-25-0301",
    currentClass: "JHS 1",
    academicYear: "2024 / 2025",
    loginCode: "DET-3019",
  },
  {
    fullName: "Kojo Antwi",
    email: "kojo.antwi@detlof.edu.gh",
    studentId: "DPS-25-0302",
    currentClass: "Basic 5",
    academicYear: "2024 / 2025",
    loginCode: "DET-5028",
  },
];

const DEFAULT_RESULTS = [
  { subject: "Mathematics", sba1: 9, sba2: 18, project: 18, examScore: 90, totalScore: 90, grade: "A", remark: "Excellent progress" },
  { subject: "English Language", sba1: 8, sba2: 17, project: 17, examScore: 80, totalScore: 82, grade: "A", remark: "Very good" },
  { subject: "Integrated Science", sba1: 8, sba2: 15, project: 16, examScore: 74, totalScore: 76, grade: "B", remark: "Keep it up" },
  { subject: "Computing / ICT", sba1: 7, sba2: 15, project: 16, examScore: 74, totalScore: 75, grade: "B", remark: "Good work" },
  { subject: "Social Studies", sba1: 7, sba2: 14, project: 15, examScore: 70, totalScore: 71, grade: "B", remark: "Good effort" },
];

const DEFAULT_ANNOUNCEMENTS = [
  { title: "Mid-term assessments begin next Monday", category: "School Notice", date: "May 14, 2025", body: "Please check the assessment schedule and bring your required materials each day." },
  { title: "Science has moved to the Science Lab", category: "Timetable Update", date: "May 9, 2025", body: "Wednesday science lessons will take place in the Science Lab from 10:30 AM." },
  { title: "Term 2 results are now available", category: "Results Update", date: "May 7, 2025", body: "Your latest academic results have been published." },
];

const DAY_ORDER = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSyncedStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const map = new Map();
    DEFAULT_STUDENTS.forEach((student) => map.set(student.studentId.toUpperCase(), student));
    if (Array.isArray(parsed)) {
      parsed.forEach((student) => {
        if (student && student.studentId) map.set(String(student.studentId).toUpperCase(), student);
      });
    }
    return Array.from(map.values());
  } catch {
    return [...DEFAULT_STUDENTS];
  }
}

function showForgotNote() {
  const box = document.getElementById("loginInfoBox");
  box.textContent = "Forgot your code? Ask the school office for your Login Code / PIN.";
  box.classList.remove("hidden");
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("loginPassword");
  const toggleButton = document.getElementById("togglePasswordBtn");
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleButton.textContent = isHidden ? "Hide" : "Show";
  toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
}

function fillCredentials(student) {
  document.getElementById("loginEmail").value = student.email;
  document.getElementById("loginStudentId").value = student.studentId;
  document.getElementById("loginPassword").value = student.loginCode;
  document.getElementById("loginPassword").type = "password";
  document.getElementById("togglePasswordBtn").textContent = "Show";
  document.getElementById("togglePasswordBtn").setAttribute("aria-label", "Show password");
  const info = document.getElementById("loginInfoBox");
  info.textContent = "Loaded credentials for " + student.fullName + " (" + student.studentId + "). Click Sign in to Portal.";
  info.classList.remove("hidden");
  document.getElementById("loginErrorBox").classList.add("hidden");
}

function sortedSchedule(schedule) {
  return [...schedule].sort((a, b) => {
    const dayDifference = (DAY_ORDER[a.day] || 99) - (DAY_ORDER[b.day] || 99);
    return dayDifference || String(a.time).localeCompare(String(b.time), undefined, { numeric: true });
  });
}

function resultRow(result, showRemark) {
  const sba1 = result.sba1 ?? 0;
  const sba2 = result.sba2 ?? 0;
  const project = result.project ?? 0;
  const examContribution = Math.round((Number(result.examScore || 0) * 0.5) * 100) / 100;
  const remarkCell = showRemark
    ? "<td>" + escapeHtml(result.remark || "—") + (result.updatedBy ? "<br><small class='update-meta'>Updated by " + escapeHtml(result.updatedBy) + "</small>" : "") + "</td>"
    : "";
  return "<tr><td><strong>" + escapeHtml(result.subject) + "</strong></td><td>" + escapeHtml(sba1) + "</td><td>" + escapeHtml(sba2) + "</td><td>" + escapeHtml(project) + "</td><td>" + escapeHtml(examContribution) + "</td><td><strong>" + escapeHtml(result.totalScore ?? "—") + "</strong></td><td><span class='grade-pill'>" + escapeHtml(result.grade || "—") + "</span></td>" + remarkCell + "</tr>";
}

function emptyRow(columns, message) {
  return "<tr><td colspan='" + columns + "' style='text-align:center;color:var(--muted);padding:20px;'>" + escapeHtml(message) + "</td></tr>";
}

function renderPortalForStudent(student) {
  activeStudent = student;
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("portalShell").classList.remove("hidden");

  document.getElementById("topbarStudentName").textContent = student.fullName;
  document.getElementById("topbarStudentMeta").textContent =
    (student.currentClass || "JHS 2") + " · " + student.studentId + " · " + student.email;
  document.getElementById("dashWelcomeHeading").textContent =
    "Good morning, " + student.fullName.split(" ")[0] + "!";
  document.getElementById("statClass").textContent = student.currentClass || "JHS 2";
  document.getElementById("statStudentId").textContent = "Student ID: " + student.studentId;

  const hasResults = Array.isArray(student.results);
  const studentResults = hasResults ? student.results : DEFAULT_RESULTS;
  const average = studentResults.length
    ? Math.round(studentResults.reduce((total, result) => total + Number(result.totalScore || 0), 0) / studentResults.length)
    : null;
  document.getElementById("statAverage").textContent = average == null ? "—" : average + "%";
  document.getElementById("statAverage").nextElementSibling.textContent =
    average == null ? "No results published yet" : "Term 2 · " + studentResults.length + " Subjects Published";

  document.getElementById("resultsSubtitle").textContent =
    student.fullName + " (" + student.studentId + ") · " + (student.currentClass || "JHS 2") + " · 2024 / 2025 Term 2";
  document.getElementById("timetableSubtitle").textContent =
    "Current Class Timetable for " + (student.currentClass || "JHS 2") + " · 2024 / 2025";

  const dashResults = document.getElementById("dashResultsBody");
  const fullResults = document.getElementById("fullResultsBody");
  dashResults.innerHTML = "";
  fullResults.innerHTML = "";
  if (studentResults.length) {
    studentResults.forEach((result) => {
      dashResults.innerHTML += resultRow(result, false);
      fullResults.innerHTML += resultRow(result, true);
    });
  } else {
    dashResults.innerHTML = emptyRow(7, "No results have been published for this student yet.");
    fullResults.innerHTML = emptyRow(8, "No results have been published for this student yet.");
  }

  const defaultSchedule = [
    { day: "Monday", time: "8:00 – 9:00", subject: "Mathematics", teacher: "Mrs. Addo", venue: (student.currentClass || "JHS 2") + " Room" },
    { day: "Monday", time: "9:00 – 10:00", subject: "English Language", teacher: "Mr. Mensah", venue: (student.currentClass || "JHS 2") + " Room" },
    { day: "Tuesday", time: "8:00 – 9:00", subject: "Integrated Science", teacher: "Mrs. Owusu", venue: "Science Lab" },
    { day: "Wednesday", time: "10:30 – 11:30", subject: "Computing / ICT", teacher: "Mr. Kofi", venue: "ICT Lab" },
    { day: "Thursday", time: "11:30 – 12:30", subject: "Social Studies", teacher: "Ms. Aidoo", venue: (student.currentClass || "JHS 2") + " Room" },
  ];
  const hasTimetable = Array.isArray(student.timetable);
  const schedule = hasTimetable ? sortedSchedule(student.timetable) : defaultSchedule;
  const dashTT = document.getElementById("dashTimetableBody");
  const fullTT = document.getElementById("fullTimetableBody");
  dashTT.innerHTML = "";
  fullTT.innerHTML = "";
  if (schedule.length) {
    schedule.forEach((item) => {
      dashTT.innerHTML += "<tr><td>" + escapeHtml(item.time) + "</td><td><strong>" + escapeHtml(item.subject) + "</strong></td><td>" + escapeHtml(item.venue || "—") + "</td></tr>";
      fullTT.innerHTML += "<tr><td>" + escapeHtml(item.day) + "</td><td>" + escapeHtml(item.time) + "</td><td><strong>" + escapeHtml(item.subject) + "</strong></td><td>" + escapeHtml(item.teacher || "Not assigned") + (item.updatedBy ? "<br><small class='update-meta'>Updated by " + escapeHtml(item.updatedBy) + "</small>" : "") + "</td><td>" + escapeHtml(item.venue || "—") + "</td></tr>";
    });
    const nextLesson = schedule[0];
    document.getElementById("statNextLesson").textContent = nextLesson.subject;
    document.getElementById("statNextLesson").nextElementSibling.textContent = nextLesson.day + " · " + nextLesson.time;
  } else {
    dashTT.innerHTML = emptyRow(3, "No timetable has been published for this student yet.");
    fullTT.innerHTML = emptyRow(5, "No timetable has been published for this student yet.");
    document.getElementById("statNextLesson").textContent = "—";
    document.getElementById("statNextLesson").nextElementSibling.textContent = "No lessons scheduled";
  }

  const updates = Array.isArray(student.updates) ? student.updates : [];
  const latestUpdate = updates.length ? [...updates].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] : null;
  const updateNotice = document.getElementById("portalUpdateNotice");
  if (latestUpdate) {
    updateNotice.classList.remove("hidden");
    document.getElementById("portalUpdateTitle").textContent = latestUpdate.title;
    document.getElementById("portalUpdateMessage").textContent = latestUpdate.message;
    document.getElementById("portalUpdateMeta").textContent =
      (latestUpdate.category || "Portal Update") + " · " + (latestUpdate.date || latestUpdate.createdAt || "") + (latestUpdate.createdBy ? " · Sent by " + latestUpdate.createdBy : "");
  } else {
    updateNotice.classList.add("hidden");
  }

  const annBox = document.getElementById("announcementsContainer");
  annBox.innerHTML = "";
  const individualUpdates = updates.map((update) => ({ ...update, individual: true }));
  [...individualUpdates, ...DEFAULT_ANNOUNCEMENTS].forEach((announcement) => {
    annBox.innerHTML +=
      "<div style='padding:14px;border:1px solid var(--line);border-radius:10px;" + (announcement.individual ? "border-left:4px solid var(--crest-gold);background:var(--crest-gold-soft);" : "") + "'>" +
      "<small style='color:" + (announcement.individual ? "var(--crest-purple);" : "var(--crest-green);") + ";font-weight:700;'>" + escapeHtml(announcement.category || "Portal Update") + (announcement.individual ? " · Individual Update" : "") + " · " + escapeHtml(announcement.date || announcement.createdAt || "") + "</small>" +
      "<h3 style='margin:6px 0;font-size:15px;color:var(--ink-deep);'>" + escapeHtml(announcement.title) + "</h3>" +
      "<p style='margin:0;color:var(--muted);font-size:12px;'>" + escapeHtml(announcement.body || announcement.message) + "</p>" +
      (announcement.createdBy ? "<small class='update-meta' style='display:block;margin-top:8px;'>Sent by " + escapeHtml(announcement.createdBy) + "</small>" : "") +
      "</div>";
  });

  document.getElementById("profileTableBody").innerHTML =
    "<tr><th>Full Name</th><td><strong>" + escapeHtml(student.fullName) + "</strong></td></tr>" +
    "<tr><th>Student ID</th><td><strong>" + escapeHtml(student.studentId) + "</strong></td></tr>" +
    "<tr><th>Student Email</th><td>" + escapeHtml(student.email) + "</td></tr>" +
    "<tr><th>Current Class</th><td>" + escapeHtml(student.currentClass || "JHS 2") + "</td></tr>" +
    "<tr><th>Academic Year</th><td>" + escapeHtml(student.academicYear || "2024 / 2025") + "</td></tr>" +
    (student.updatedBy ? "<tr><th>Last Portal Update</th><td>" + escapeHtml(student.updatedBy) + " · " + escapeHtml(student.updatedAt || "") + "</td></tr>" : "");
}

function switchTab(tabName) {
  document.querySelectorAll(".portal-tab").forEach((element) => element.classList.add("hidden"));
  document.getElementById("tab-" + tabName).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-tab") === tabName);
  });
}

function logoutPortal() {
  activeStudent = null;
  sessionStorage.removeItem("detlof_portal_role");
  sessionStorage.removeItem("detlof_teacher");
  document.getElementById("portalShell").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("loginPassword").value = "";
}

document.getElementById("portalLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const studentId = document.getElementById("loginStudentId").value.trim().toUpperCase();
  const password = document.getElementById("loginPassword").value.trim();
  const errorBox = document.getElementById("loginErrorBox");
  errorBox.classList.add("hidden");

  const matchedLocal = getSyncedStudents().find(
    (student) =>
      String(student.email || "").trim().toLowerCase() === email &&
      String(student.studentId || "").trim().toUpperCase() === studentId &&
      String(student.loginCode || "").trim() === password
  );

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, studentId, password, syncedRecord: matchedLocal || null }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.student) {
        renderPortalForStudent(data.student);
        return;
      }
    }
  } catch {
    // Standalone HTML mode uses the local synced records.
  }

  if (matchedLocal) {
    renderPortalForStudent(matchedLocal);
    return;
  }

  errorBox.textContent = "We could not sign you in with those details. Verify your Email, Student ID, and generated Login Code.";
  errorBox.classList.remove("hidden");
});

const params = new URLSearchParams(window.location.search);
if (params.get("email") && params.get("studentId") && params.get("code")) {
  fillCredentials({
    fullName: params.get("fullName") || "Detlof Student",
    email: params.get("email"),
    studentId: params.get("studentId"),
    loginCode: params.get("code"),
  });
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && activeStudent) {
    const updated = getSyncedStudents().find((student) => student.studentId === activeStudent.studentId);
    if (updated) renderPortalForStudent(updated);
  }
});
