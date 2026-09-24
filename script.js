const STORAGE_KEY = "detlof_bulk_import_codes";
const PORTAL_API_BASE = "http://127.0.0.1:5000";
let activeStudent = null;

const DEFAULT_RESULTS = [
  { subject: "Mathematics", sba1: 9, sba2: 18, project: 18, examScore: 90, totalScore: 90, grade: "A", remark: "Excellent progress" },
  { subject: "English Language", sba1: 8, sba2: 17, project: 17, examScore: 80, totalScore: 82, grade: "A", remark: "Very good" },
  { subject: "Integrated Science", sba1: 8, sba2: 15, project: 16, examScore: 74, totalScore: 76, grade: "B", remark: "Keep it up" },
  { subject: "Computing / ICT", sba1: 7, sba2: 15, project: 16, examScore: 74, totalScore: 75, grade: "B", remark: "Good work" },
  { subject: "Social Studies", sba1: 7, sba2: 14, project: 15, examScore: 70, totalScore: 71, grade: "B", remark: "Good effort" },
];

const DEFAULT_STUDENTS = [
  {
    fullName: "Eliana Ama Owusu",
    email: "eliana.owusu@detlof.edu.gh",
    studentId: "DPS-24-0187",
    currentClass: "JHS 2",
    academicYear: "2024 / 2025",
    loginCode: "Detlof2025!",
    promotionStatus: "promoted",
    promotedClass: "JHS 3",
    termResults: {
      term1: {
        results: DEFAULT_RESULTS.map((r) => ({ ...r })),
        gpa: 3.4,
        subjectCount: DEFAULT_RESULTS.length,
      },
      term2: {
        results: DEFAULT_RESULTS.map((r) => ({ ...r })),
        gpa: 3.6,
        subjectCount: DEFAULT_RESULTS.length,
      },
      term3: {
        results: DEFAULT_RESULTS.map((r) => ({ ...r })),
        gpa: 3.5,
        subjectCount: DEFAULT_RESULTS.length,
      },
    },
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

function normalizeStudent(student) {
  if (!student || typeof student !== "object") return student;
  const normalized = { ...student };
  const parentPhone = normalized.parentPhone || normalized.profileParentPhone || "";
  const whatsappNumber = normalized.whatsappNumber || normalized.profileWhatsApp || "";
  normalized.parentPhone = parentPhone;
  normalized.profileParentPhone = parentPhone;
  normalized.whatsappNumber = whatsappNumber;
  normalized.profileWhatsApp = whatsappNumber;
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
  const sba1 = result.sba1 ?? 0;
  const sba2 = result.sba2 ?? 0;
  const project = result.project ?? 0;
  const examContribution = Math.round((Number(result.examScore || 0) * 0.5) * 100) / 100;
  const remarkCell = showRemark
    ? "<td>" + escapeHtml(result.remark || "—") + (result.updatedBy ? "<br><small class='update-meta'>Updated by " + escapeHtml(result.updatedBy) + "</small>" : "") + "</td>"
    : "";
  return "<tr><td><strong>" + escapeHtml(result.subject) + "</strong></td><td>" + escapeHtml(sba1) + "</td><td>" + escapeHtml(sba2) + "</td><td>" + escapeHtml(project) + "</td><td>" + escapeHtml(examContribution) + "</td><td><strong>" + escapeHtml(result.totalScore ?? "—") + "</strong></td><td><span class='grade-pill'>" + escapeHtml(result.grade || "—") + "</span></td>" + remarkCell + "</tr>";
}

function calculateGrade(score) {
  const s = Number(score) || 0;
  if (s >= 90) return "A";
  if (s >= 80) return "B";
  if (s >= 70) return "C";
  if (s >= 60) return "D";
  if (s >= 50) return "E";
  return "F";
}

function gradeToPoints(grade) {
  const points = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.5, F: 0.0 };
  return points[grade] ?? 0;
}

function calculateTermGPA(results) {
  if (!results || !results.length) return null;
  const totalPoints = results.reduce((sum, result) => sum + gradeToPoints(result.grade || calculateGrade(result.totalScore)), 0);
  return Math.round((totalPoints / results.length) * 100) / 100;
}

const CLASS_PROGRESSION = [
  "Creche", "KG", "Lower KG", "Upper KG",
  "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6",
  "JHS 1", "JHS 2", "JHS 3",
  "SHS 1", "SHS 2", "SHS 3",
];

function nextClass(currentClass) {
  const idx = CLASS_PROGRESSION.indexOf(currentClass);
  return idx >= 0 && idx < CLASS_PROGRESSION.length - 1 ? CLASS_PROGRESSION[idx + 1] : currentClass;
}

function getTermResults(student, term) {
  if (!student.termResults || !student.termResults[term]) return null;
  return student.termResults[term];
}

function getAllTermResults(student) {
  const terms = student.termResults || {};
  return {
    term1: terms.term1 || null,
    term2: terms.term2 || null,
    term3: terms.term3 || null,
  };
}

function calculateCumulativeGPA(student) {
  const allTerms = getAllTermResults(student);
  const termGPAs = [];
  Object.values(allTerms).forEach((termData) => {
    if (termData && termData.gpa != null) {
      termGPAs.push(termData.gpa);
    }
  });
  if (!termGPAs.length) return null;
  const cumulative = termGPAs.reduce((a, b) => a + b, 0) / termGPAs.length;
  return Math.round(cumulative * 100) / 100;
}

function getAllGradesForStudent(student) {
  const allTerms = getAllTermResults(student);
  const grades = [];
  const scores = [];
  Object.values(allTerms).forEach((termData) => {
    if (termData && Array.isArray(termData.results)) {
      termData.results.forEach((result) => {
        grades.push(result.grade || calculateGrade(result.totalScore));
        scores.push(Number(result.totalScore || 0));
      });
    }
  });
  if (!grades.length) {
    const studentResults = Array.isArray(student.results) ? student.results : DEFAULT_RESULTS;
    studentResults.forEach((result) => {
      grades.push(result.grade || calculateGrade(result.totalScore));
      scores.push(Number(result.totalScore || 0));
    });
  }
  return { grades, scores };
}

function calculatePromotionStatus(student) {
  const { grades } = getAllGradesForStudent(student);
  if (!grades.length) return null;

  const failingGrades = grades.filter((g) => g === "F" || g === "E");
  const conditionalGrades = grades.filter((g) => g === "D" || g === "C");

  if (failingGrades.length >= 2) {
    return "repeated";
  }
  if (failingGrades.length >= 1 || conditionalGrades.length > 0) {
    return "on_try";
  }
  return "promoted";
}

function getPromotionNoticeData(promotionStatus, cumulativeGPA, student) {
  const nextCls = student.promotedClass || nextClass(student.currentClass || "JHS 2");
  const notices = {
    promoted: {
      category: "🎓 Congratulations",
      title: "Promoted to " + nextCls,
      message: "Congratulations! You have been successfully promoted to " + nextCls + ". Your hard work and dedication have paid off. Keep up the excellent performance!",
      gpaColor: "var(--crest-green)",
      borderColor: "var(--crest-green)",
      bgColor: "var(--crest-green-soft)",
    },
    on_try: {
      category: "⚠️ Conditional Promotion",
      title: "Promoted to " + nextCls + " (On Trial)",
      message: "You have been promoted to " + nextCls + " on trial. Please focus on improving your grades in the areas where you scored D, C, E, or F. Consistent effort will secure your position.",
      gpaColor: "var(--crest-gold)",
      borderColor: "var(--crest-gold)",
      bgColor: "var(--crest-gold-soft)",
    },
    repeated: {
      category: "📚 Academic Decision",
      title: "Required to Repeat " + (student.currentClass || "JHS 2"),
      message: "Based on your academic performance, you are required to repeat " + (student.currentClass || "JHS 2") + " next year. You must focus on improving your F and E grades. Speak to your class teacher for a recovery plan.",
      gpaColor: "var(--crest-red)",
      borderColor: "var(--crest-red)",
      bgColor: "var(--crest-red-soft)",
    },
  };
  return notices[promotionStatus] || notices.on_try;
}

function emptyRow(columns, message) {
  return "<tr><td colspan='" + columns + "' style='text-align:center;color:var(--muted);padding:20px;'>" + escapeHtml(message) + "</td></tr>";
}

function configureStudentProfileAccess() {
  ["profileParentName", "profileParentPhone", "profileWhatsApp", "profileHomeAddress"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.readOnly = true;
  });
  const picInput = document.getElementById("profilePicInput");
  const picBtn = document.getElementById("changePicBtn");
  if (picInput) picInput.style.display = "none";
  if (picBtn) picBtn.style.display = "none";
}

function renderPortalForStudent(student) {
  activeStudent = mergeStudentData(activeStudent, student);
  student = activeStudent;
  configureStudentProfileAccess();
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("portalShell").classList.remove("hidden");

  document.getElementById("topbarStudentName").textContent = student.fullName;
  document.getElementById("topbarStudentMeta").textContent =
    (student.currentClass || "JHS 2") + " · " + student.studentId + " · " + student.email;
  document.getElementById("dashWelcomeHeading").textContent =
    "Good morning, " + student.fullName.split(" ")[0] + "!";
  document.getElementById("statClass").textContent = student.currentClass || "JHS 2";
  document.getElementById("statStudentId").textContent = "Student ID: " + student.studentId;

  const allTerms = getAllTermResults(student);
  const termCount = Object.values(allTerms).filter((t) => t != null).length;
  const cumulativeGPA = calculateCumulativeGPA(student);
  document.getElementById("dashTermInfo").textContent =
    termCount >= 3 ? "Third Term · Results Released" : termCount > 0 ? "Term " + termCount : "No Results Yet";

  const promoChip = document.getElementById("dashPromoChip");
  const promoIcon = document.getElementById("dashPromoIcon");
  const promoText = document.getElementById("dashPromoText");
  const promotionStatus = student.promotionStatus || calculatePromotionStatus(student);
  if (termCount >= 3 && cumulativeGPA != null && promotionStatus) {
    const statuses = {
      promoted: { icon: "🎓", text: "Promoted to " + (student.promotedClass || nextClass(student.currentClass)), color: "var(--crest-green)", bg: "var(--crest-green-soft)" },
      on_try: { icon: "⚠️", text: "On Trial — Promoted", color: "var(--crest-gold)", bg: "var(--crest-gold-soft)" },
      repeated: { icon: "📚", text: "Repeating " + (student.currentClass || "JHS 2"), color: "var(--crest-red)", bg: "var(--crest-red-soft)" },
    };
    const s = statuses[promotionStatus] || statuses.on_try;
    promoIcon.textContent = s.icon;
    promoText.textContent = s.text + " · GPA " + cumulativeGPA;
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
      : (termCount ? "Cumulative GPA: " + cumulativeGPA + " · " + termCount + " Term(s)" : "Term 2 · " + studentResults.length + " Subjects Published");

  const displayedTerm = student.displayedTerm || "all";
  document.getElementById("resultsSubtitle").textContent =
    student.fullName + " (" + student.studentId + ") · " + (student.currentClass || "JHS 2") + " · Academic Year " + (student.academicYear || "2024 / 2025") + (displayedTerm !== "all" ? " · " + displayedTerm.replace("term", "Term ") : "");
  document.getElementById("timetableSubtitle").textContent =
    "Current Class Timetable for " + (student.currentClass || "JHS 2") + " · 2024 / 2025";

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
  promotionStatus = student.promotionStatus || calculatePromotionStatus(student);
  if (termCount >= 3 && cumulativeGPA != null && promotionStatus) {
    if (promoBadge) promoBadge.classList.remove("hidden");
    const promoIcon = promoNoticeInner.querySelector(".promo-icon");
    if (promoIcon) {
      const iconMap = { promoted: "🎓", on_try: "⚠️", repeated: "📚" };
      promoIcon.textContent = iconMap[promotionStatus] || "🎓";
    }
    const noticeData = getPromotionNoticeData(promotionStatus, cumulativeGPA, student);
    promoCategory.textContent = noticeData.category;
    promoTitle.textContent = noticeData.title;
    promoMessage.textContent = noticeData.message;
    promoGPA.textContent = "GPA " + cumulativeGPA;
    promoNotice.style.borderLeft = "6px solid " + noticeData.borderColor;
    promoNotice.style.background = noticeData.bgColor;
    promoNotice.classList.remove("hidden");
  } else {
    promoNotice.classList.add("hidden");
    if (promoBadge) promoBadge.classList.add("hidden");
  }

  const cumulativeBody = document.getElementById("cumulativeSummaryBody");
  cumulativeBody.innerHTML = "";
  if (termCount > 0 || cumulativeGPA != null) {
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
      "<tr style='border-top:2px solid var(--line);'><td><strong>Cumulative</strong></td><td>" + totalGrades.length + "</td><td><strong>" + (cumulativeAvg != null ? cumulativeAvg + "%" : "—") + "</strong></td><td><strong>" + (cumulativeGPA != null ? cumulativeGPA : "—") + "</strong></td><td><strong>" + (totalDistStr || "—") + "</strong></td></tr>";
  } else {
    cumulativeBody.innerHTML = emptyRow(5, "No term results have been published yet.");
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

  var profileFormSection = document.getElementById("profileEditForm");
  if (profileFormSection) {
    document.getElementById("profileFullName").value = student.fullName || "";
    document.getElementById("profileEmail").value = student.email || "";
    document.getElementById("profileStudentId").value = student.studentId || "";
    document.getElementById("profileClass").value = student.currentClass || "";
    document.getElementById("profileAcademicYear").value = student.academicYear || "2024 / 2025";
    document.getElementById("profileParentName").value = student.parentName || "";
    document.getElementById("profileParentPhone").value = student.parentPhone || "";
    document.getElementById("profileWhatsApp").value = student.whatsappNumber || "";
    document.getElementById("profileHomeAddress").value = student.homeAddress || "";
    document.getElementById("profileLoginCode").value = student.loginCode || "";
    if (student.profilePic) {
      document.getElementById("profilePicPreview").src = student.profilePic;
    } else {
      document.getElementById("profilePicPreview").src = "detlofcreast.svg";
    }
  }

  if (profileFormSection) {
    profileFormSection.onsubmit = function (e) {
      e.preventDefault();
      const updated = {
        fullName: document.getElementById("profileFullName").value.trim() || activeStudent.fullName,
        parentName: document.getElementById("profileParentName").value.trim(),
        homeAddress: document.getElementById("profileHomeAddress").value.trim(),
        updatedBy: "Student Self-Update",
        updatedAt: new Date().toISOString(),
      };
      Object.assign(activeStudent, updated);
      saveSyncedStudents();
      window.alert("Profile updated. Changes are saved locally and will sync with your records.");
    };
  }

  const profileTable = document.getElementById("profileTableBody");
  if (profileTable) profileTable.innerHTML = "";
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
    renderPortalForStudent(remoteStudent);
    return;
  }

  if (matchedLocal && canUseLocal) {
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
  const allTerms = getAllTermResults(activeStudent);
  const displayedTerm = activeStudent.displayedTerm || "all";
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Academic Results - ' + escapeHtml(activeStudent.fullName) + '</title>';
  html += '<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Inter, Arial, sans-serif;padding:40px;color:#2a1730;}';
  html += '.header{text-align:center;margin-bottom:30px;}';
  html += '.logo{width:110px;height:102px;}';
  html += '.subtitle{color:#75697a;font-size:12px;}';
  html += 'h1{color:#560f75;font-size:24px;margin:8px 0;}';
  html += '.info{color:#75697a;font-size:12px;margin:4px 0;}';
  html += 'table{width:100%;border-collapse:collapse;margin:16px 0;}';
  html += 'th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#75697a;padding:8px;border-bottom:1px solid #eadfe9;}';
  html += 'td{padding:8px;border-bottom:1px solid #eadfe9;font-size:12px;}';
  html += '.grade-pill{display:inline-block;width:24px;height:24px;border-radius:6px;font-weight:800;font-size:11px;background:#e5f3ea;color:#3f7d55;text-align:center;line-height:24px;}';
  html += '.gpa-box{background:#fffaf0;padding:14px;border-radius:8px;margin:16px 0;border-left:4px solid #f2b500;}';
  html += '.promo-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;}';
  html += '</style></head><body>';
  html += '<div class="header"><img class="logo" src="detlofcreast.svg" alt="Detlof Crest"><h1>DETLOF PREPARATORY SCHOOL</h1>';
  html += '<div class="subtitle">Student Academic Results Report</div>';
  html += '<div class="info">' + escapeHtml(activeStudent.fullName) + ' · ' + escapeHtml(activeStudent.studentId) + ' · ' + escapeHtml(activeStudent.currentClass || "JHS 2") + '</div>';
  html += '<div class="info">Academic Year: ' + escapeHtml(activeStudent.academicYear || "2024 / 2025") + '</div></div>';

  const hasTermResults = Object.values(allTerms).some((t) => t != null);
  if (displayedTerm !== "all" && allTerms[displayedTerm]) {
    const termData = allTerms[displayedTerm];
    const label = { term1: "First Term", term2: "Second Term", term3: "Third Term" }[displayedTerm];
    html += '<h2 style="color:#560f75;font-size:18px;margin:20px 0 10px;">' + label + ' Results</h2>';
    html += renderResultsTableHTML(termData.results || []);
    html += renderGPABox(calculateTermGPASimple(termData.results || []), termData.results || [], label);
  } else if (hasTermResults) {
    const termLabels = { term1: "First Term", term2: "Second Term", term3: "Third Term" };
    Object.keys(termLabels).forEach((tk) => {
      const td = allTerms[tk];
      if (td && Array.isArray(td.results)) {
        html += '<h2 style="color:#560f75;font-size:18px;margin:20px 0 10px;">' + termLabels[tk] + ' Results</h2>';
        html += renderResultsTableHTML(td.results);
        html += renderGPABox(td.gpa != null ? td.gpa : calculateTermGPASimple(td.results), td.results, termLabels[tk]);
      }
    });
  }

  const cumulativeGPA = calculateCumulativeGPA(activeStudent);
  if (cumulativeGPA != null) {
    const promoStatus = activeStudent.promotionStatus || calculatePromotionStatus(activeStudent);
    const promoText = { promoted: "Promoted", on_try: "On Trial", repeated: "Repeating" }[promoStatus] || "";
    html += '<div class="gpa-box"><strong>Cumulative GPA: ' + cumulativeGPA + '</strong>';
    if (promoText) html += ' · <span class="promo-badge" style="background:#e5f3ea;color:#3f7d55;">' + promoText + '</span>';
    html += '</div>';
  } else {
    const sr = Array.isArray(activeStudent.results) ? activeStudent.results : DEFAULT_RESULTS;
    if (sr.length) {
      html += '<div class="gpa-box"><strong>Overall Average: ' + Math.round(sr.reduce((t, r) => t + Number(r.totalScore || 0), 0) / sr.length) + '%</strong></div>';
    }
  }

  html += '<div style="margin-top:30px;font-size:11px;color:#75697a;text-align:center;">Generated from Detlof Student Portal · ' + new Date().toLocaleDateString("en-GB") + '</div>';
  html += '</body></html>';

  const printWindow = window.open("", "_blank");
  if (!printWindow) { window.alert("Please allow pop-ups to preview and download results."); return; }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(function () { printWindow.print(); }, 500);
}

function renderResultsTableHTML(results) {
  let html = '<table><thead><tr><th>Subject</th><th>SBA 1</th><th>SBA 2</th><th>Project</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead><tbody>';
  results.forEach((r) => {
    html += "<tr><td><strong>" + escapeHtml(r.subject) + "</strong></td><td>" + escapeHtml(r.sba1) + "</td><td>" + escapeHtml(r.sba2) + "</td><td>" + escapeHtml(r.project) + "</td><td>" + escapeHtml(Math.round((Number(r.examScore || 0) * 0.5) * 100) / 100) + "</td><td><strong>" + escapeHtml(r.totalScore) + "</strong></td><td>" + gradePillHTML(r.grade || calculateGrade(r.totalScore)) + "</td></tr>";
  });
  html += "</tbody></table>";
  return html;
}

function gradePillHTML(grade) {
  const colors = { A: "#e5f3ea", B: "#fff3c4", C: "#ffe4ea", D: "#f3e7f7" };
  const textColors = { A: "#3f7d55", B: "#b87a00", C: "#d9003b", D: "#560f75" };
  const bg = colors[grade] || "#ffe4ea";
  const tc = textColors[grade] || "#d9003b";
  return '<span class="grade-pill" style="background:' + bg + ';color:' + tc + ';">' + escapeHtml(grade) + '</span>';
}

function calculateTermGPASimple(results) {
  if (!results || !results.length) return null;
  const pointsMap = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.5, F: 0.0 };
  const totalPoints = results.reduce((sum, r) => sum + (pointsMap[r.grade || calculateGrade(r.totalScore)] || 0), 0);
  return Math.round((totalPoints / results.length) * 100) / 100;
}

function renderGPABox(gpa, results, label) {
  if (gpa == null) return "";
  let dist = {};
  results.forEach((r) => {
    const g = r.grade || calculateGrade(r.totalScore);
    dist[g] = (dist[g] || 0) + 1;
  });
  const distStr = Object.keys(dist).sort().map((g) => g + "×" + dist[g]).join(", ");
  return '<div class="gpa-box"><strong>' + label + ' GPA: ' + gpa + '</strong> · <span style="color:#75697a;">' + distStr + '</span></div>';
}

function downloadTimetablePDF() {
  if (!activeStudent) { window.alert("Please sign in to download your timetable."); return; }
  const defaultSchedule = [
    { day: "Monday", time: "8:00 – 9:00", subject: "Mathematics", teacher: "Mrs. Addo", venue: (activeStudent.currentClass || "JHS 2") + " Room" },
    { day: "Monday", time: "9:00 – 10:00", subject: "English Language", teacher: "Mr. Mensah", venue: (activeStudent.currentClass || "JHS 2") + " Room" },
    { day: "Tuesday", time: "8:00 – 9:00", subject: "Integrated Science", teacher: "Mrs. Owusu", venue: "Science Lab" },
    { day: "Wednesday", time: "10:30 – 11:30", subject: "Computing / ICT", teacher: "Mr. Kofi", venue: "ICT Lab" },
    { day: "Thursday", time: "11:30 – 12:30", subject: "Social Studies", teacher: "Ms. Aidoo", venue: (activeStudent.currentClass || "JHS 2") + " Room" },
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
  html += '<div class="info">' + escapeHtml(activeStudent.currentClass || "JHS 2") + ' · ' + escapeHtml(activeStudent.academicYear || "2024 / 2025") + '</div>';
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

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && activeStudent) {
    const updated = getSyncedStudents().find(
      (student) => String(student.studentId).toUpperCase() === String(activeStudent.studentId).toUpperCase()
    );
    if (updated) renderPortalForStudent(updated);
  }
});

const termFilter = document.getElementById("resultsTermFilter");
if (termFilter) {
  termFilter.addEventListener("change", (e) => {
    if (!activeStudent) return;
    activeStudent.displayedTerm = e.target.value;
    renderPortalForStudent(activeStudent);
  });
}

const downloadResultsBtn = document.getElementById("downloadResultsPdfBtn");
if (downloadResultsBtn) {
  downloadResultsBtn.onclick = downloadResultsPDF;
}
const downloadTimetableBtn = document.getElementById("downloadTimetablePdfBtn");
if (downloadTimetableBtn) {
  downloadTimetableBtn.onclick = downloadTimetablePDF;
}
