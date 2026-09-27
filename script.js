const STORAGE_KEY = "detlof_bulk_import_codes";
const PORTAL_API_BASE = "http://127.0.0.1:5000";
let activeStudent = null;

// ACADEMIC_YEAR, grading, the default results and the report builders live in
// detlof-report.js, which detlof-student-portal.html loads before this file.

const DEFAULT_STUDENTS = detlofSeedDefaultResults(detlofBuildRosterStudents());

const ROSTER_STUDENT_INDEX = (function () {
  const byName = new Map();
  const byId = new Map();
  DEFAULT_STUDENTS.forEach((student) => {
    byName.set(detlofNormalizeName(student.fullName), student);
    byId.set(String(student.studentId).toUpperCase(), student);
  });
  return { byName, byId };
})();

function rosterMatch(value) {
  const query = String(value || "").trim();
  if (!query) return null;
  const byId = ROSTER_STUDENT_INDEX.byId.get(query.toUpperCase());
  if (byId) return byId;
  return ROSTER_STUDENT_INDEX.byName.get(detlofNormalizeName(query)) || null;
}

const DEFAULT_ANNOUNCEMENTS = [
  { title: "Term 3 assessments begin next Monday", category: "School Notice", date: "May 14, 2026", body: "Please check the assessment schedule and bring your required materials each day." },
  { title: "Science has moved to the Science Lab", category: "Timetable Update", date: "May 9, 2026", body: "Wednesday science lessons will take place in the Science Lab from 10:30 AM." },
  { title: "Term 3 results are now available", category: "Results Update", date: "May 7, 2026", body: "Your latest academic results have been published." },
];

const DAY_ORDER = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

function normalizeStudent(student) {
  if (!student || typeof student !== "object") return student;
  const normalized = { ...student };
  const parentPhone = normalized.parentPhone || normalized.profileParentPhone || "";
  const whatsappNumber = normalized.whatsappNumber || normalized.profileWhatsApp || "";
  normalized.parentPhone = parentPhone;
  normalized.profileParentPhone = parentPhone;
  normalized.whatsappNumber = whatsappNumber;
  normalized.profileWhatsApp = whatsappNumber;
  const roster = rosterMatch(normalized.fullName) || rosterMatch(normalized.studentId);
  if (roster) {
    normalized.fullName = roster.fullName;
    if (!normalized.currentClass) normalized.currentClass = roster.currentClass;
  }
  return normalized;
}

function mergeStudentData(existing, incoming) {
  const base = existing || {};
  const update = incoming || {};
  const merged = { ...base, ...update };
  const existingParentPhone = base.parentPhone || base.profileParentPhone || "";
  const existingWhatsApp = base.whatsappNumber || base.profileWhatsApp || "";
  const incomingParentPhone = update.parentPhone || update.profileParentPhone || "";
  const incomingWhatsApp = update.whatsappNumber || update.profileWhatsApp || "";
  if (incomingParentPhone) {
    merged.parentPhone = incomingParentPhone;
    merged.profileParentPhone = incomingParentPhone;
  } else if (existingParentPhone) {
    merged.parentPhone = existingParentPhone;
    merged.profileParentPhone = existingParentPhone;
  }
  if (incomingWhatsApp) {
    merged.whatsappNumber = incomingWhatsApp;
    merged.profileWhatsApp = incomingWhatsApp;
  } else if (existingWhatsApp) {
    merged.whatsappNumber = existingWhatsApp;
    merged.profileWhatsApp = existingWhatsApp;
  }
  return normalizeStudent(merged);
}

async function fetchPortalApi(path, options = {}) {
  const urls = [path];
  const backendUrl = PORTAL_API_BASE + path;
  if (window.location.href.indexOf(PORTAL_API_BASE) !== 0) {
    urls.push(backendUrl);
  }
  let lastResponse = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status === 401) return response;
      lastResponse = response;
    } catch {
    }
  }
  return lastResponse;
}

function findSyncedStudent(credentials) {
  const email = String(credentials.email || "").trim().toLowerCase();
  const studentId = String(credentials.studentId || "").trim().toUpperCase();
  const loginCode = String(credentials.loginCode || credentials.password || "").trim();
  return getSyncedStudents().find((student) =>
    String(student.email || "").trim().toLowerCase() === email &&
    String(student.studentId || "").trim().toUpperCase() === studentId &&
    String(student.loginCode || "").trim() === loginCode
  );
}

function upsertSyncedStudent(student) {
  const normalized = normalizeStudent(student);
  const students = getSyncedStudents();
  const index = students.findIndex((item) =>
    String(item.studentId || "").trim().toUpperCase() === String(normalized.studentId || "").trim().toUpperCase()
  );
  if (index >= 0) {
    students[index] = mergeStudentData(students[index], normalized);
  } else {
    students.unshift(normalized);
  }
  saveSyncedStudents();
  return students[index >= 0 ? index : 0];
}

async function resolveStudentFromCredentials(credentials, allowLocal = true) {
  const payload = {
    email: String(credentials.email || "").trim().toLowerCase(),
    studentId: String(credentials.studentId || "").trim().toUpperCase(),
    password: String(credentials.loginCode || credentials.password || "").trim(),
  };
  const response = await fetchPortalApi("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response) {
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.student) return normalizeStudent(data.student);
    }
    if (response.status === 401) return null;
  }
  if (!allowLocal) return null;
  const localStudent = findSyncedStudent(payload);
  return localStudent ? normalizeStudent(localStudent) : null;
}

function studentFromUrlParams(params) {
  return normalizeStudent({
    fullName: params.get("fullName") || "Detlof Student",
    email: params.get("email"),
    studentId: params.get("studentId"),
    loginCode: params.get("code"),
    currentClass: params.get("class") || "JHS 2",
    academicYear: params.get("year") || "2024 / 2025",
    parentPhone: params.get("parentPhone") || params.get("profileParentPhone") || "",
    profileParentPhone: params.get("profileParentPhone") || params.get("parentPhone") || "",
    whatsappNumber: params.get("whatsappNumber") || params.get("profileWhatsApp") || "",
    profileWhatsApp: params.get("profileWhatsApp") || params.get("whatsappNumber") || "",
  });
}

async function resolveStudentFromUrlParams(params) {
  const credentials = {
    email: params.get("email"),
    studentId: params.get("studentId"),
    loginCode: params.get("code"),
  };
  const remoteStudent = await resolveStudentFromCredentials(credentials, false);
  if (remoteStudent) return remoteStudent;
  const localStudent = findSyncedStudent(credentials);
  if (localStudent) return mergeStudentData(localStudent, studentFromUrlParams(params));
  return studentFromUrlParams(params);
}

function getSyncedStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const map = new Map();
    DEFAULT_STUDENTS.forEach((student) => map.set(student.studentId.toUpperCase(), normalizeStudent(student)));
    if (Array.isArray(parsed)) {
      parsed.forEach((student) => {
        if (student && student.studentId) {
          const key = String(student.studentId).toUpperCase();
          const existing = map.get(key);
          map.set(key, normalizeStudent(existing ? mergeStudentData(existing, student) : student));
        }
      });
    }
    return Array.from(map.values());
  } catch {
    return DEFAULT_STUDENTS.map((student) => normalizeStudent(student));
  }
}

function saveSyncedStudents() {
  const synced = getSyncedStudents().map((student) => normalizeStudent(student));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
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
  const credentials = normalizeStudent(student);
  document.getElementById("loginEmail").value = credentials.email;
  document.getElementById("loginStudentId").value = credentials.studentId;
  document.getElementById("loginPassword").value = credentials.loginCode;
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
  const classScore = Number(result.classScore || 0);
  const examScore = Number(result.examScore || 0);
  const total = Math.round((classScore + examScore) * 100) / 100;
  const grade = result.grade || calculateGrade(total);
  const remarkCell = showRemark
    ? "<td>" + escapeHtml(result.remark || "—") + (result.updatedBy ? "<br><small class='update-meta'>Updated by " + escapeHtml(result.updatedBy) + "</small>" : "") + "</td>"
    : "";
  return "<tr><td><strong>" + escapeHtml(result.subject) + "</strong></td><td>" + escapeHtml(classScore) + "</td><td>" + escapeHtml(examScore) + "</td><td><strong>" + escapeHtml(total) + "</strong></td><td><span class='grade-pill'>" + escapeHtml(grade) + "</span></td>" + remarkCell + "</tr>";
}

function emptyRow(columns, message) {
  return "<tr><td colspan='" + columns + "' style='text-align:center;color:var(--muted);padding:20px;'>" + escapeHtml(message) + "</td></tr>";
}

const ADMIN_MANAGED_PROFILE_FIELDS = [
  "profileParentName", "profileParentRelation", "profileGender", "profileDateOfBirth",
  "profileBloodGroup", "profileParentPhone", "profileWhatsApp", "profileParentEmail",
  "profileEmergencyContact", "profileHomeAddress", "profileAllergies", "profileInterests",
  "profileEmail", "profileStudentId", "profileClass", "profileAcademicYear", "profileLoginCode",
];

function configureStudentProfileAccess() {
  ADMIN_MANAGED_PROFILE_FIELDS.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.readOnly = true;
      field.setAttribute("aria-readonly", "true");
    }
  });
  const picInput = document.getElementById("profilePicInput");
  const picBtn = document.getElementById("changePicBtn");
  if (picInput) picInput.style.display = "none";
  if (picBtn) picBtn.style.display = "none";
}

// Tells the student which details the school has on file and which are still
// missing, so an empty field is never a mystery.
const PROFILE_COMPLETION_FIELDS = [
  ["profileFullName", "Full name"],
  ["profileEmail", "Email address"],
  ["profileClass", "Class"],
  ["profileGender", "Gender"],
  ["profileDateOfBirth", "Date of birth"],
  ["profileBloodGroup", "Blood group"],
  ["profileParentName", "Parent / guardian name"],
  ["profileParentRelation", "Relationship"],
  ["profileParentPhone", "Parent phone"],
  ["profileWhatsApp", "Parent WhatsApp"],
  ["profileParentEmail", "Parent email"],
  ["profileEmergencyContact", "Emergency contact"],
  ["profileHomeAddress", "Home address"],
];

function renderProfileCompletion() {
  const box = document.getElementById("profileCompletion");
  if (!box) return;
  const missing = PROFILE_COMPLETION_FIELDS.filter(([id]) => {
    const field = document.getElementById(id);
    return !field || !String(field.value || "").trim();
  });
  const total = PROFILE_COMPLETION_FIELDS.length;
  const have = total - missing.length;
  const pct = Math.round((have / total) * 100);

  box.classList.remove("hidden");
  if (!missing.length) {
    box.innerHTML = "<div class='completion-bar'><span style='width:100%'></span></div>" +
      "<p class='completion-text'>All " + total + " profile details are complete. Everything here is maintained by the school office.</p>";
    return;
  }
  box.innerHTML = "<div class='completion-bar'><span style='width:" + pct + "%'></span></div>" +
    "<p class='completion-text'><strong>" + have + " of " + total + "</strong> details on file. " +
    "Still to be added by the school office: " +
    missing.map(([, label]) => escapeHtml(label)).join(", ") + ".</p>";
}

function renderPortalForStudent(student) {
  activeStudent = mergeStudentData(activeStudent, student);
  student = activeStudent;
  configureStudentProfileAccess();
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("portalShell").classList.remove("hidden");

  document.getElementById("topbarStudentName").textContent = student.fullName;
  document.getElementById("topbarStudentMeta").textContent =
    (student.currentClass || "KG 1") + " · " + student.studentId + " · " + student.email;
  document.getElementById("dashWelcomeHeading").textContent =
    "Good morning, " + student.fullName.split(" ")[0] + "!";
  document.getElementById("statClass").textContent = student.currentClass || "KG 1";
  document.getElementById("statStudentId").textContent = "Student ID: " + student.studentId;

  const allTerms = getAllTermResults(student);
  const termCount = Object.values(allTerms).filter((t) => t != null).length;
  const annualAverage = calculateCumulativeGPA(student);
  document.getElementById("dashTermInfo").textContent =
    termCount >= 3 ? "Third Term · Results Released" : termCount > 0 ? "Term " + termCount : "No Results Yet";

  const promoChip = document.getElementById("dashPromoChip");
  const promoIcon = document.getElementById("dashPromoIcon");
  const promoText = document.getElementById("dashPromoText");
  const promotionStatus = student.promotionStatus || calculatePromotionStatus(student);
  if (termCount >= 3 && annualAverage != null && promotionStatus) {
    const statuses = {
      promoted: { icon: "🎓", text: "Promoted to " + (student.promotedClass || nextClass(student.currentClass)), color: "var(--crest-green)", bg: "var(--crest-green-soft)" },
      on_try: { icon: "⚠️", text: "On Trial — Promoted", color: "var(--crest-gold)", bg: "var(--crest-gold-soft)" },
      repeated: { icon: "📚", text: "Repeating " + (student.currentClass || "JHS 2"), color: "var(--crest-red)", bg: "var(--crest-red-soft)" },
    };
    const s = statuses[promotionStatus] || statuses.on_try;
    promoIcon.textContent = s.icon;
    promoText.textContent = s.text + " · GPA " + annualAverage;
    promoChip.style.color = s.color;
    promoChip.style.background = s.bg;
    promoChip.classList.remove("hidden");
  } else {
    promoChip.classList.add("hidden");
  }

  const hasResults = Array.isArray(student.results);
  const studentResults = hasResults ? student.results : DEFAULT_RESULTS;
  const average = studentResults.length
    ? Math.round(studentResults.reduce((total, result) => total + Number(result.totalScore || 0), 0) / studentResults.length)
    : null;
  document.getElementById("statAverage").textContent = average == null ? "—" : average + "%";

  document.getElementById("statAverage").nextElementSibling.textContent =
    average == null
      ? (termCount ? termCount + " Term(s) Published" : "No results published yet")
      : (termCount ? "Annual Average: " + annualAverage + "% · " + termCount + " Term(s)" : "Term 2 · " + studentResults.length + " Subjects Published");

  const displayedTerm = student.displayedTerm || "all";
  const selectedTermLabel = displayedTerm === "all" ? "All Terms" : (TERM_LABELS[displayedTerm] || displayedTerm);
  const termFilterEl = document.getElementById("resultsTermFilter");
  if (termFilterEl && termFilterEl.value !== displayedTerm) termFilterEl.value = displayedTerm;
  document.getElementById("resultsSubtitle").textContent =
    student.fullName + " (" + student.studentId + ") · " + (student.currentClass || "KG 1") +
    " · Academic Year " + (student.academicYear || ACADEMIC_YEAR) +
    " · Viewing: " + selectedTermLabel;
  document.getElementById("timetableSubtitle").textContent =
    "Current Class Timetable for " + (student.currentClass || "KG 1") + " · " + ACADEMIC_YEAR;

  const dashResults = document.getElementById("dashResultsBody");
  const fullResults = document.getElementById("fullResultsBody");
  dashResults.innerHTML = "";
  fullResults.innerHTML = "";

  let resultsToDisplay = [];
  if (displayedTerm !== "all" && allTerms[displayedTerm] && Array.isArray(allTerms[displayedTerm].results)) {
    resultsToDisplay = allTerms[displayedTerm].results;
  } else if (hasResults && studentResults.length) {
    resultsToDisplay = studentResults;
  } else if (termCount > 0) {
    Object.values(allTerms).forEach((termData) => {
      if (termData && Array.isArray(termData.results)) {
        termData.results.forEach((r) => resultsToDisplay.push(r));
      }
    });
  }

  if (resultsToDisplay.length) {
    resultsToDisplay.forEach((result) => {
      dashResults.innerHTML += resultRow(result, false);
      fullResults.innerHTML += resultRow(result, true);
    });
  } else if (studentResults.length) {
    studentResults.forEach((result) => {
      dashResults.innerHTML += resultRow(result, false);
      fullResults.innerHTML += resultRow(result, true);
    });
  } else {
    dashResults.innerHTML = emptyRow(7, "No results have been published for this student yet.");
    fullResults.innerHTML = emptyRow(8, "No results have been published for this student yet.");
  }

  const promoNotice = document.getElementById("promotionNotice");
  const promoNoticeInner = document.getElementById("promotionNoticeInner");
  const promoCategory = document.getElementById("promotionNoticeCategory");
  const promoTitle = document.getElementById("promotionNoticeTitle");
  const promoMessage = document.getElementById("promotionNoticeMessage");
  const promoGPA = document.getElementById("promotionNoticeGPA");

  const promoBadge = document.getElementById("resultsPromoBadge");
  if (termCount >= 3 && annualAverage != null && promotionStatus) {
    if (promoBadge) promoBadge.classList.remove("hidden");
    const promoIcon = promoNoticeInner.querySelector(".promo-icon");
    if (promoIcon) {
      const iconMap = { promoted: "🎓", on_try: "⚠️", repeated: "📚", not_promoted: "📚", pending: "⏳" };
      promoIcon.textContent = iconMap[promotionStatus] || "🎓";
    }
    const noticeData = getPromotionNoticeData(promotionStatus, annualAverage, student);
    promoCategory.textContent = noticeData.category;
    promoTitle.textContent = noticeData.title;
    promoMessage.textContent = noticeData.message;
    promoGPA.textContent = "GPA " + annualAverage;
    promoNotice.style.borderLeft = "6px solid " + noticeData.borderColor;
    promoNotice.style.background = noticeData.bgColor;
    promoNotice.classList.remove("hidden");
  } else {
    promoNotice.classList.add("hidden");
    if (promoBadge) promoBadge.classList.add("hidden");
  }

  const cumulativeBody = document.getElementById("cumulativeSummaryBody");
  cumulativeBody.innerHTML = "";
  if (termCount > 0 || annualAverage != null) {
    const termLabels = { term1: "Term 1", term2: "Term 2", term3: "Term 3" };
    Object.keys(termLabels).forEach((termKey) => {
      const termData = allTerms[termKey];
      if (termData && Array.isArray(termData.results)) {
        const termAvg = termData.results.length
          ? Math.round(termData.results.reduce((s, r) => s + Number(r.totalScore || 0), 0) / termData.results.length)
          : null;
        const gradeDist = {};
        termData.results.forEach((r) => {
          const g = r.grade || calculateGrade(r.totalScore);
          gradeDist[g] = (gradeDist[g] || 0) + 1;
        });
        const distStr = Object.keys(gradeDist).sort().map((g) => g + "×" + gradeDist[g]).join(", ");
        const termGPA = termData.gpa != null ? termData.gpa : (termData.results.length ? calculateTermGPA(termData.results) : null);
        cumulativeBody.innerHTML +=
          "<tr><td>" + termLabels[termKey] + "</td><td>" + termData.results.length + "</td><td>" + (termAvg != null ? termAvg + "%" : "—") + "</td><td>" + (termGPA != null ? termGPA : "—") + "</td><td>" + (distStr || "—") + "</td></tr>";
      }
    });
    const { grades: totalGrades, scores: totalScores } = getAllGradesForStudent(student);
    const totalDist = {};
    totalGrades.forEach((g) => { totalDist[g] = (totalDist[g] || 0) + 1; });
    const totalDistStr = Object.keys(totalDist).sort().map((g) => g + "×" + totalDist[g]).join(", ");
    const cumulativeAvg = totalGrades.length ? Math.round(totalScores.reduce((s, sc) => s + sc, 0) / totalScores.length) : null;
    cumulativeBody.innerHTML +=
      "<tr style='border-top:2px solid var(--line);'><td><strong>Cumulative</strong></td><td>" + totalGrades.length + "</td><td><strong>" + (cumulativeAvg != null ? cumulativeAvg + "%" : "—") + "</strong></td><td><strong>" + (annualAverage != null ? annualAverage : "—") + "</strong></td><td><strong>" + (totalDistStr || "—") + "</strong></td></tr>";
  } else {
    cumulativeBody.innerHTML = emptyRow(5, "No term results have been published yet.");
  }

  const defaultSchedule = [
    { day: "Monday", time: "8:00 – 9:00", subject: "Mathematics", teacher: "Mrs. Addo", venue: (student.currentClass || "KG 1") + " Room" },
    { day: "Monday", time: "9:00 – 10:00", subject: "English Language", teacher: "Mr. Mensah", venue: (student.currentClass || "KG 1") + " Room" },
    { day: "Tuesday", time: "8:00 – 9:00", subject: "Integrated Science", teacher: "Mrs. Owusu", venue: (student.currentClass || "KG 1") + " Room" },
    { day: "Wednesday", time: "10:30 – 11:30", subject: "Computing / ICT", teacher: "Mr. Kofi", venue: "ICT Lab" },
    { day: "Thursday", time: "11:30 – 12:30", subject: "Social Studies", teacher: "Ms. Aidoo", venue: (student.currentClass || "KG 1") + " Room" },
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

  var profileFormSection = document.getElementById("profileEditForm");
  if (profileFormSection) {
    const setProfileValue = (id, value) => {
      const field = document.getElementById(id);
      if (field) field.value = value == null ? "" : String(value);
    };
    setProfileValue("profileFullName", student.fullName);
    setProfileValue("profileEmail", student.email);
    setProfileValue("profileStudentId", student.studentId);
    setProfileValue("profileClass", student.currentClass);
    setProfileValue("profileAcademicYear", student.academicYear || ACADEMIC_YEAR);
    setProfileValue("profileParentName", student.parentName);
    setProfileValue("profileParentRelation", student.parentRelation);
    setProfileValue("profileGender", student.gender);
    setProfileValue("profileDateOfBirth", student.dateOfBirth);
    setProfileValue("profileBloodGroup", student.bloodGroup);
    setProfileValue("profileParentPhone", student.parentPhone);
    setProfileValue("profileWhatsApp", student.whatsappNumber);
    setProfileValue("profileParentEmail", student.parentEmail);
    setProfileValue("profileEmergencyContact", student.emergencyContact);
    setProfileValue("profileHomeAddress", student.homeAddress);
    setProfileValue("profileAllergies", student.allergies);
    setProfileValue("profileInterests", student.interests);
    setProfileValue("profileLoginCode", student.loginCode);
    setProfileValue("profileStudentId", student.studentId);
    setProfileValue("profileEmail", student.email);
    setProfileValue("profileClass", student.currentClass);
    setProfileValue("profileAcademicYear", student.academicYear || ACADEMIC_YEAR);
    if (student.profilePic) {
      document.getElementById("profilePicPreview").src = student.profilePic;
    } else {
      document.getElementById("profilePicPreview").src = "detlofcreast.svg";
    }
    renderProfileCompletion(student);
  }

  if (profileFormSection) {
    profileFormSection.onsubmit = function (e) {
      e.preventDefault();
      const updated = {
        fullName: document.getElementById("profileFullName").value.trim() || activeStudent.fullName,
        updatedBy: "Student Self-Update",
        updatedAt: new Date().toISOString(),
      };
      Object.assign(activeStudent, updated);
      saveSyncedStudents();
      window.alert("Profile updated. Only your name can be changed; other details are managed by the school administrator.");
    };
  }

  const profileTable = document.getElementById("profileTableBody");
  if (profileTable) profileTable.innerHTML = "";

  updateTermDownloadLabel();
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
  forgetStudent();
  document.getElementById("portalShell").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("loginPassword").value = "";
}

const REMEMBER_KEY = "detlof_portal_remembered_student";

// Re-open the last signed-in student so their profile is already filled in.
function rememberStudent(student) {
  if (!student) return;
  try {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({
      email: student.email || "",
      studentId: student.studentId || "",
      loginCode: student.loginCode || "",
    }));
  } catch {
    /* storage full or unavailable - remembering is best effort */
  }
}

function forgetStudent() {
  try { localStorage.removeItem(REMEMBER_KEY); } catch { /* ignore */ }
}

async function restoreRememberedStudent() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) || "null"); } catch { saved = null; }
  if (!saved || !saved.email || !saved.studentId) return false;

  // Show the signed-in shell only once we actually have a record.
  const local = findSyncedStudent({ email: saved.email, studentId: saved.studentId, loginCode: saved.loginCode });
  let student = local;
  if (!student) {
    const response = await fetchPortalApi("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: saved.email, studentId: saved.studentId, password: saved.loginCode }),
    });
    if (response && response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.student) student = normalizeStudent(data.student);
    }
  }
  if (!student) { forgetStudent(); return false; }
  renderPortalForStudent(student);
  return true;
}

document.getElementById("portalLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const studentId = document.getElementById("loginStudentId").value.trim().toUpperCase();
  const password = document.getElementById("loginPassword").value.trim();
  const errorBox = document.getElementById("loginErrorBox");
  errorBox.classList.add("hidden");

  const matchedLocal = findSyncedStudent({ email, studentId, loginCode: password });
  const payload = { email, studentId, password, syncedRecord: matchedLocal || null };
  let remoteStudent = null;
  let canUseLocal = false;

  const response = await fetchPortalApi("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response) {
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.student) remoteStudent = normalizeStudent(data.student);
    } else if (response.status === 401) {
      if (matchedLocal && window.location.protocol === "file:") {
        canUseLocal = true;
      } else {
        errorBox.textContent = "We could not sign you in with those details. Verify your Email, Student ID, and generated Login Code.";
        errorBox.classList.remove("hidden");
        return;
      }
    } else {
      canUseLocal = true;
    }
  } else {
    canUseLocal = true;
  }

  if (remoteStudent) {
    rememberStudent(remoteStudent);
    renderPortalForStudent(remoteStudent);
    return;
  }

  if (matchedLocal && canUseLocal) {
    rememberStudent(matchedLocal);
    renderPortalForStudent(matchedLocal);
    return;
  }

  errorBox.textContent = "We could not sign you in with those details. Verify your Email, Student ID, and generated Login Code.";
  errorBox.classList.remove("hidden");
});

function downloadMyLoginCode() {
  if (!activeStudent) { window.alert("Please sign in to download your login code."); return; }
  const content = [
    "Detlof Preparatory School - Student Portal Login",
    "Student: " + activeStudent.fullName,
    "Class: " + activeStudent.currentClass,
    "Student ID: " + activeStudent.studentId,
    "Student Email: " + activeStudent.email,
    "Login Code / PIN: " + activeStudent.loginCode,
    "",
    "Portal: detlof-student-portal.html",
  ].join("\r\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = activeStudent.studentId + "-portal-login.txt";
  link.click();
  URL.revokeObjectURL(url);
}


function downloadResultsPDF() {
  if (!activeStudent) { window.alert("Please sign in to download your results."); return; }
  openPrintPreview(renderFullResultsReportHTML(activeStudent), "Please allow pop-ups to preview and download results.");
}

function activeTermKey() {
  const filter = document.getElementById("resultsTermFilter");
  const value = filter && filter.value ? filter.value : "all";
  return value === "all" ? "all" : value;
}

function downloadMyResults() {
  if (!activeStudent) { window.alert("Please sign in to download your full results."); return; }
  const terms = collectPublishedTerms(activeStudent);
  if (!terms.length) {
    window.alert("No results have been published for your class yet. Your report will be ready once results are uploaded.");
    return;
  }
  const termKey = activeTermKey();
  if (termKey !== "all") {
    const match = terms.find((t) => t.key === termKey);
    if (!match) {
      window.alert((TERM_LABELS[termKey] || "That term") + " has not been published yet.");
      return;
    }
    openPrintPreview(
      renderTermReportHTML(activeStudent, termKey),
      "Please allow pop-ups to preview and download your results."
    );
    return;
  }
  downloadResultsPDF();
}

function downloadResultsCSV() {
  if (!activeStudent) { window.alert("Please sign in to download your results."); return; }
  const terms = collectPublishedTerms(activeStudent);
  const termKey = activeTermKey();
  const selected = termKey === "all" ? terms : terms.filter((t) => t.key === termKey);
  if (!selected.length) { window.alert("No results have been published for the selected term yet."); return; }

  const header = ["Student Name", "Student ID", "Class", "Academic Year", "Term", "Subject", "Class Score (40%)", "Exam Score (60%)", "Total (100%)", "Grade", "Remark"];
  const escapeCell = (value) => '"' + String(value == null ? "" : value).replaceAll('"', '""') + '"';
  const lines = [header.map(escapeCell).join(",")];

  selected.forEach((term) => {
    term.data.results.forEach((result) => {
      lines.push([
        activeStudent.fullName,
        activeStudent.studentId,
        activeStudent.currentClass,
        activeStudent.academicYear || ACADEMIC_YEAR,
        term.label,
        result.subject,
        Number(result.classScore) || 0,
        Number(result.examScore) || 0,
        resultTotal(result),
        resultGrade(result),
        result.remark || "",
      ].map(escapeCell).join(","));
    });
  });

  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = activeStudent.studentId + "-full-results-" + new Date().toISOString().slice(0, 10) + ".csv";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTimetablePDF() {
  if (!activeStudent) { window.alert("Please sign in to download your timetable."); return; }
  const defaultSchedule = [
    { day: "Monday", time: "8:00 – 9:00", subject: "Mathematics", teacher: "Mrs. Addo", venue: (activeStudent.currentClass || "KG 1") + " Room" },
    { day: "Monday", time: "9:00 – 10:00", subject: "English Language", teacher: "Mr. Mensah", venue: (activeStudent.currentClass || "KG 1") + " Room" },
    { day: "Tuesday", time: "8:00 – 9:00", subject: "Integrated Science", teacher: "Mrs. Owusu", venue: (activeStudent.currentClass || "KG 1") + " Room" },
    { day: "Wednesday", time: "10:30 – 11:30", subject: "Computing / ICT", teacher: "Mr. Kofi", venue: "ICT Lab" },
    { day: "Thursday", time: "11:30 – 12:30", subject: "Social Studies", teacher: "Ms. Aidoo", venue: (activeStudent.currentClass || "KG 1") + " Room" },
  ];
  const schedule = Array.isArray(activeStudent.timetable) ? sortedSchedule(activeStudent.timetable) : defaultSchedule;

  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Class Timetable - ' + escapeHtml(activeStudent.fullName) + '</title>';
  html += '<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Inter, Arial, sans-serif;padding:40px;color:#2a1730;}';
  html += '.header{text-align:center;margin-bottom:30px;}';
  html += '.logo{width:110px;height:102px;}';
  html += '.subtitle{color:#75697a;font-size:12px;}';
  html += 'h1{color:#560f75;font-size:24px;margin:8px 0;}';
  html += '.info{color:#75697a;font-size:12px;margin:4px 0;}';
  html += 'table{width:100%;border-collapse:collapse;margin:16px 0;}';
  html += 'th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#75697a;padding:8px;border-bottom:2px solid #eadfe9;}';
  html += 'td{padding:8px;border-bottom:1px solid #eadfe9;font-size:12px;}';
  html += '</style></head><body>';
  html += '<div class="header"><img class="logo" src="detlofcreast.svg" alt="Detlof Crest"><h1>DETLOF PREPARATORY SCHOOL</h1>';
  html += '<div class="subtitle">Weekly Class Timetable</div>';
  html += '<div class="info">' + escapeHtml(activeStudent.currentClass || "KG 1") + ' · ' + escapeHtml(activeStudent.academicYear || ACADEMIC_YEAR) + '</div>';
  html += '<div class="info">' + escapeHtml(activeStudent.fullName) + ' · ' + escapeHtml(activeStudent.studentId) + '</div></div>';
  html += '<table><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Venue</th></tr></thead><tbody>';
  if (schedule.length) {
    schedule.forEach((item) => {
      html += "<tr><td><strong>" + escapeHtml(item.day) + "</strong></td><td>" + escapeHtml(item.time) + "</td><td>" + escapeHtml(item.subject) + "</td><td>" + escapeHtml(item.teacher || "Not assigned") + "</td><td>" + escapeHtml(item.venue || "—") + "</td></tr>";
    });
  } else {
    html += '<tr><td colspan="5" style="text-align:center;color:#75697a;padding:20px;">No timetable has been published.</td></tr>';
  }
  html += "</tbody></table>";
  html += '<div style="margin-top:30px;font-size:11px;color:#75697a;text-align:center;">Generated from Detlof Student Portal · ' + new Date().toLocaleDateString("en-GB") + '</div>';
  html += '</body></html>';

  const printWindow = window.open("", "_blank");
  if (!printWindow) { window.alert("Please allow pop-ups to preview and download your timetable."); return; }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(function () { printWindow.print(); }, 500);
}

function downloadMyTimetable() {
  if (!activeStudent) { window.alert("Please sign in to download your timetable."); return; }
  downloadTimetablePDF();
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && activeStudent) {
    const updated = getSyncedStudents().find(
      (student) => String(student.studentId).toUpperCase() === String(activeStudent.studentId).toUpperCase()
    );
    if (updated) renderPortalForStudent(updated);
  }
});

function updateTermDownloadLabel() {
  const label = document.getElementById("downloadSelectedTermLabel");
  if (!label) return;
  const termKey = activeTermKey();
  if (termKey === "all") {
    label.textContent = "Download Full Results (All Terms)";
    return;
  }
  const termLabel = TERM_LABELS[termKey] || "Term";
  const subjects = activeStudent && collectPublishedTerms(activeStudent).find((t) => t.key === termKey);
  label.textContent = subjects
    ? "Download " + termLabel + " (" + subjects.data.results.length + " subjects)"
    : "Download " + termLabel;
}

const termFilter = document.getElementById("resultsTermFilter");
if (termFilter) {
  termFilter.addEventListener("change", (e) => {
    if (!activeStudent) return;
    activeStudent.displayedTerm = e.target.value;
    renderPortalForStudent(activeStudent);
    updateTermDownloadLabel();
  });
}

const downloadResultsBtn = document.getElementById("downloadResultsPdfBtn");
if (downloadResultsBtn) {
  downloadResultsBtn.onclick = downloadMyResults;
}
const downloadTimetableBtn = document.getElementById("downloadTimetablePdfBtn");
if (downloadTimetableBtn) {
  downloadTimetableBtn.onclick = downloadTimetablePDF;
}

// Open straight into the last student's profile so their details are already
// filled in, rather than making them sign in on every visit.
restoreRememberedStudent();
