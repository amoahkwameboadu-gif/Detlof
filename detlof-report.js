// Detlof Preparatory School — Shared Academic Engine
// Pure, DOM-free grading, promotion and report-rendering helpers used by both
// the student portal (script.js) and the admin portal. Loaded before either page's
// own script so the same report is produced in both places.

const ACADEMIC_YEAR = "2025 / 2026";

const TERM_LABELS = { term1: "First Term", term2: "Second Term", term3: "Third Term" };

const GRADE_POINTS = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.5, F: 0.0 };

// Starting results every roster student begins with, so both portals agree on
// what a student sees before any term is published by the school.
const DEFAULT_RESULTS = [
  { subject: "Mathematics", classScore: 32, examScore: 56, totalScore: 88, grade: "B", remark: "Very good" },
  { subject: "English Language", classScore: 34, examScore: 60, totalScore: 94, grade: "A", remark: "Excellent progress" },
  { subject: "Integrated Science", classScore: 30, examScore: 55, totalScore: 85, grade: "B", remark: "Keep it up" },
  { subject: "Computing / ICT", classScore: 28, examScore: 50, totalScore: 78, grade: "C", remark: "Good work" },
  { subject: "Social Studies", classScore: 30, examScore: 52, totalScore: 82, grade: "B", remark: "Good effort" },
];

function detlofDefaultResults() {
  return DEFAULT_RESULTS.map((row) => ({ ...row }));
}

function detlofSeedDefaultResults(students, term) {
  const termKey = term || "term1";
  return (students || []).map((student) => {
    if (student.termResults && student.termResults[termKey]) return student;
    return {
      ...student,
      termResults: {
        ...(student.termResults || {}),
        [termKey]: { results: detlofDefaultResults(), gpa: null, subjectCount: detlofDefaultResults().length },
      },
    };
  });
}
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function calculateGrade(score) {
  const s = Number(score) || 0;
  if (s >= 80) return "A";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  if (s >= 50) return "D";
  if (s >= 40) return "E";
  return "F";
}

function gradeLabel(grade) {
  const labels = { A: "Excellent", B: "Very Good", C: "Good", D: "Pass", E: "Pass/Needs Improvement", F: "Fail" };
  return labels[grade] || grade;
}

function gradeToPoints(grade) {
  const points = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.5, F: 0.0 };
  return points[grade] ?? 0;
}

function calculateTermGPA(results) {
  if (!results || !results.length) return null;
  const totalPoints = results.reduce((sum, result) => {
    const total = Number(result.totalScore) || (Number(result.classScore || 0) + Number(result.examScore || 0));
    return sum + gradeToPoints(result.grade || calculateGrade(total));
  }, 0);
  return Math.round((totalPoints / results.length) * 100) / 100;
}

function calculateTermAverage(results) {
  if (!results || !results.length) return null;
  const sum = results.reduce((total, result) => total + (Number(result.totalScore) || (Number(result.classScore || 0) + Number(result.examScore || 0))), 0);
  return Math.round((sum / results.length) * 100) / 100;
}

function annualSubjectAverage(student, subject) {
  const allTerms = getAllTermResults(student);
  const termKeys = Object.keys(allTerms).filter((k) => allTerms[k]);
  if (termKeys.length < 3) return null;
  const scores = termKeys.map((k) => {
    const r = (allTerms[k].results || []).find((item) => item.subject === subject);
    return r ? Number(r.totalScore) || (Number(r.classScore || 0) + Number(r.examScore || 0)) : 0;
  });
  if (scores.length < 3) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / 3) * 100) / 100;
}

function calculateAnnualAverage(student) {
  const allTerms = getAllTermResults(student);
  const termKeys = Object.keys(allTerms).filter((k) => allTerms[k]);
  if (termKeys.length < 3) return null;
  const subjects = new Set();
  termKeys.forEach((k) => {
    if (Array.isArray(allTerms[k].results)) {
      allTerms[k].results.forEach((r) => subjects.add(r.subject));
    }
  });
  const scores = [];
  subjects.forEach((subject) => {
    const avg = annualSubjectAverage(student, subject);
    if (avg != null) scores.push(avg);
  });
  if (!scores.length || scores.length < subjects.size) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}

function nextClass(currentClass) {
  return detlofNextClass(currentClass);
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
  return calculateAnnualAverage(student);
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
  const allTerms = getAllTermResults(student);
  const termKeys = Object.keys(allTerms).filter((k) => allTerms[k]);
  if (termKeys.length < 3) return null;

  const annualAverage = calculateAnnualAverage(student);
  if (annualAverage == null) {
    return "pending";
  }

  if (annualAverage >= 50) {
    return "promoted";
  }
  return "not_promoted";
}

function getPromotionNoticeData(promotionStatus, annualAverage, student) {
  const nextCls = student.promotedClass || nextClass(student.currentClass || "KG 1");
  const avg = annualAverage != null ? annualAverage + "%" : "—";
  const notices = {
    promoted: {
      category: "Academic Year End Result",
      title: "Promoted to " + nextCls,
      message: "Congratulations! You have been successfully promoted to " + nextCls + ". Your annual average is " + avg + ". Keep up the excellent performance!",
      borderColor: "var(--crest-green)",
      bgColor: "var(--crest-green-soft)",
    },
    on_try: {
      category: "Conditional Promotion",
      title: "Promoted to " + nextCls + " (On Trial)",
      message: "You have been promoted to " + nextCls + " on trial. Your annual average is " + avg + ". Focus on improving your grades next year.",
      borderColor: "var(--crest-gold)",
      bgColor: "var(--crest-gold-soft)",
    },
    not_promoted: {
      category: "Academic Decision",
      title: "Not Promoted from " + (student.currentClass || "KG 1"),
      message: "Based on your annual average of " + avg + ", you are required to repeat " + (student.currentClass || "KG 1") + " next year. Speak to your class teacher for a recovery plan.",
      borderColor: "var(--crest-red)",
      bgColor: "var(--crest-red-soft)",
    },
    pending: {
      category: "In Progress",
      title: "Results Pending",
      message: "Your annual result is still being calculated. All three terms must be published before your final result is available.",
      borderColor: "var(--crest-gold)",
      bgColor: "var(--crest-gold-soft)",
    },
    repeated: {
      category: "Academic Decision",
      title: "Required to Repeat " + (student.currentClass || "KG 1"),
      message: "Based on your academic performance, you are required to repeat " + (student.currentClass || "KG 1") + " next year. Speak to your class teacher for a recovery plan.",
      borderColor: "var(--crest-red)",
      bgColor: "var(--crest-red-soft)",
    },
  };
  return notices[promotionStatus] || notices.pending;
}


const REPORT_STYLES = '*{box-sizing:border-box;margin:0;padding:0;}' +
  'body{font-family:Inter, Arial, sans-serif;padding:40px;color:#2a1730;}' +
  '.header{text-align:center;margin-bottom:30px;}' +
  '.logo{width:110px;height:102px;}' +
  '.subtitle{color:#75697a;font-size:12px;}' +
  'h1{color:#560f75;font-size:24px;margin:8px 0;}' +
  'h2{color:#560f75;font-size:18px;margin:22px 0 10px;}' +
  '.info{color:#75697a;font-size:12px;margin:4px 0;}' +
  'table{width:100%;border-collapse:collapse;margin:16px 0;font-size:12px;}' +
  'th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#75697a;padding:8px;border-bottom:2px solid #eadfe9;}' +
  'td{padding:8px;border-bottom:1px solid #eadfe9;font-size:12px;}' +
  'td.num,th.num{text-align:center;}' +
  '.grade-pill{display:inline-block;min-width:24px;padding:2px 6px;border-radius:6px;font-weight:800;font-size:11px;text-align:center;}' +
  '.gpa-box{background:#fffaf0;padding:14px;border-radius:8px;margin:16px 0;border-left:4px solid #f2b500;font-size:12px;}' +
  '.promo-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;}' +
  '.remark{color:#75697a;font-size:11px;}' +
  '.empty{color:#75697a;font-size:12px;font-style:italic;padding:12px 0;}' +
  '.footer{margin-top:30px;font-size:11px;color:#75697a;text-align:center;}' +
  '@media print{body{padding:16px;}.page-break{page-break-before:always;}}';

function reportHeaderHTML(student, subtitle) {
  return '<div class="header"><img class="logo" src="detlofcreast.svg" alt="Detlof Crest">' +
    '<h1>DETLOF PREPARATORY SCHOOL</h1>' +
    '<div class="subtitle">' + escapeHtml(subtitle) + '</div>' +
    '<div class="info">' + escapeHtml(student.fullName) + ' &middot; ' + escapeHtml(student.studentId) +
    ' &middot; ' + escapeHtml(student.currentClass || "—") + '</div>' +
    '<div class="info">Academic Year: ' + escapeHtml(student.academicYear || ACADEMIC_YEAR) + '</div></div>';
}

function collectPublishedTerms(student) {
  const allTerms = getAllTermResults(student);
  return [
    { key: "term1", label: "First Term", data: allTerms.term1 },
    { key: "term2", label: "Second Term", data: allTerms.term2 },
    { key: "term3", label: "Third Term", data: allTerms.term3 },
  ].filter((term) => term.data && Array.isArray(term.data.results) && term.data.results.length);
}

function resultTotal(result) {
  const total = Number(result.totalScore);
  if (total) return total;
  return Math.round(((Number(result.classScore) || 0) + (Number(result.examScore) || 0)) * 100) / 100;
}

function resultGrade(result) {
  return result.grade || calculateGrade(resultTotal(result));
}

function renderConsolidatedResultsTableHTML(student) {
  const terms = collectPublishedTerms(student);
  if (!terms.length) return '<p class="empty">No results have been published for this student yet.</p>';

  const subjects = [];
  terms.forEach((term) => {
    term.data.results.forEach((result) => {
      if (subjects.indexOf(result.subject) === -1) subjects.push(result.subject);
    });
  });

  let html = '<table><thead><tr><th>Subject</th>';
  terms.forEach((term) => {
    const short = term.label.charAt(0);
    html += '<th class="num">T' + short + ' Class</th>' +
      '<th class="num">T' + short + ' Exam</th>' +
      '<th class="num">T' + short + ' Total</th>' +
      '<th class="num">T' + short + ' Grade</th>';
  });
  html += '<th class="num">Average</th><th class="num">Grade</th></tr></thead><tbody>';

  subjects.forEach((subject) => {
    html += '<tr><td><strong>' + escapeHtml(subject) + '</strong></td>';
    const totals = [];
    terms.forEach((term) => {
      const found = term.data.results.find((r) => r.subject === subject);
      if (!found) {
        html += '<td class="num">&mdash;</td><td class="num">&mdash;</td><td class="num">&mdash;</td><td class="num">&mdash;</td>';
        return;
      }
      const total = resultTotal(found);
      totals.push(total);
      html += '<td class="num">' + escapeHtml(Number(found.classScore) || 0) + '</td>' +
        '<td class="num">' + escapeHtml(Number(found.examScore) || 0) + '</td>' +
        '<td class="num"><strong>' + escapeHtml(total) + '</strong></td>' +
        '<td class="num">' + gradePillHTML(resultGrade(found)) + '</td>';
    });
    const average = totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 100) / 100 : null;
    html += '<td class="num"><strong>' + (average == null ? "&mdash;" : average) + '</strong></td>' +
      '<td class="num">' + (average == null ? "&mdash;" : gradePillHTML(calculateGrade(average))) + '</td></tr>';
  });

  html += '</tbody></table>';
  return html;
}

// A single-term report: every subject for that term with class score, exam score,
// total, grade and the teacher's remark, plus the term summary and the student's
// running position across all terms. This is what a student gets when they pick a
// term in the results filter and press Download.
function renderTermReportHTML(student, termKey) {
  const label = TERM_LABELS[termKey] || "Term";
  const allTerms = collectPublishedTerms(student);
  const match = allTerms.find((t) => t.key === termKey);
  const results = match && Array.isArray(match.data.results) ? match.data.results : [];

  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<title>' + escapeHtml(label) + ' Results - ' + escapeHtml(student.fullName) + '</title>' +
    '<style>' + REPORT_STYLES + '</style></head><body>';
  html += reportHeaderHTML(student, label + " Results Report \u2014 All Subjects");

  if (!results.length) {
    html += '<p class="empty">' + escapeHtml(label) + ' results have not been published yet.</p>';
    html += '<div class="footer">Generated from Detlof Student Portal &middot; ' + new Date().toLocaleDateString("en-GB") + '</div>';
    return html + '</body></html>';
  }

  const shortLabel = label.replace(" Term", "");
  html += '<h2>' + escapeHtml(label) + ' \u2014 Subject Breakdown (' + results.length + ' subjects)</h2>';
  html += renderResultsTableHTML(results, true);

  html += '<h2>' + escapeHtml(label) + ' Summary</h2>';
  html += '<table><thead><tr><th>Term</th><th class="num">Subjects</th><th class="num">Average</th>' +
    '<th class="num">GPA</th><th>Grade Distribution</th></tr></thead><tbody>';
  html += renderTermSummaryRowHTML(results, label);
  html += '</tbody></table>';

  html += '<h2>All Published Terms</h2>';
  html += '<table><thead><tr><th>Term</th><th class="num">Subjects</th><th class="num">Average</th>' +
    '<th class="num">GPA</th><th>Grade Distribution</th></tr></thead><tbody>';
  allTerms.forEach((term) => {
    html += renderTermSummaryRowHTML(term.data.results, term.label);
  });
  const { grades: allGrades, scores: allScores } = getAllGradesForStudent(student);
  const cumulativeAvg = allScores.length
    ? Math.round((allScores.reduce((sum, score) => sum + Number(score), 0) / allScores.length) * 100) / 100
    : null;
  const annualAverage = calculateCumulativeGPA(student);
  const dist = {};
  allGrades.forEach((grade) => { dist[grade] = (dist[grade] || 0) + 1; });
  const distStr = Object.keys(dist).sort().map((grade) => grade + " &times;" + dist[grade]).join(", ");
  html += '<tr><td><strong>Cumulative</strong></td><td class="num">' + allGrades.length + '</td>' +
    '<td class="num"><strong>' + (cumulativeAvg == null ? "&mdash;" : cumulativeAvg) + '</strong></td>' +
    '<td class="num"><strong>' + (annualAverage == null ? "&mdash;" : annualAverage) + '</strong></td>' +
    '<td><strong>' + (distStr || "&mdash;") + '</strong></td></tr>';
  html += '</tbody></table>';

  const subjectCount = results.length;
  const termAverage = calculateTermAverage(results);
  html += '<div class="gpa-box"><strong>' + escapeHtml(shortLabel) + ' Term:</strong> ' + subjectCount + ' subjects &middot; ' +
    '<strong>Average:</strong> ' + (termAverage == null ? "&mdash;" : termAverage + "%") + ' &middot; ' +
    '<strong>Annual Average:</strong> ' + (annualAverage == null ? "Results Pending" : annualAverage + "%") + '</div>';

  if (annualAverage != null) {
    const status = student.promotionStatus || calculatePromotionStatus(student);
    const notice = getPromotionNoticeData(status, annualAverage, student);
    const textColors = { promoted: "#3f7d55", on_try: "#b87a00", repeated: "#d9003b", not_promoted: "#d9003b", pending: "#b87a00" };
    const bgColors = { promoted: "#e5f3ea", on_try: "#fff3c4", repeated: "#ffe4ea", not_promoted: "#ffe4ea", pending: "#fff3c4" };
    const statusLabel = { promoted: "Promoted", on_try: "On Trial", repeated: "Repeating", not_promoted: "Not Promoted", pending: "Results Pending" }[status] || "";
    html += '<div class="gpa-box"><strong>Promotion Status:</strong> ' +
      '<span class="promo-badge" style="background:' + (bgColors[status] || "#fff3c4") + ';color:' + (textColors[status] || "#b87a00") + ';">' +
      statusLabel + '</span><br><span style="color:#75697a;">' + escapeHtml(notice.title) + " \u2014 " + escapeHtml(notice.message) + '</span></div>';
  }

  html += '<div class="footer">Generated from Detlof Student Portal &middot; ' + new Date().toLocaleDateString("en-GB") + '</div>';
  return html + '</body></html>';
}

function renderFullResultsReportHTML(student) {
  const terms = collectPublishedTerms(student);
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<title>Full Academic Results - ' + escapeHtml(student.fullName) + '</title>' +
    '<style>' + REPORT_STYLES + '</style></head><body>';
  html += reportHeaderHTML(student, "Full Academic Results Report — All Subjects & All Terms");

  html += '<h2>Consolidated Subject Performance (All Subjects, All Terms)</h2>';
  html += renderConsolidatedResultsTableHTML(student);

  terms.forEach((term) => {
    html += '<h2>' + term.label + ' Results</h2>';
    html += renderResultsTableHTML(term.data.results, true);
    html += renderTermSummaryBox(term.data.results, term.label);
  });

  html += renderAnnualSummaryHTML(student);
  html += '<div class="footer">Generated from Detlof Student Portal &middot; ' + new Date().toLocaleDateString("en-GB") + '</div>';
  html += '</body></html>';
  return html;
}

function renderAnnualSummaryHTML(student) {
  const terms = collectPublishedTerms(student);
  let html = '<h2>Term Summary &amp; Cumulative Performance</h2>';

  if (!terms.length) {
    return html + '<p class="empty">No term results have been published yet.</p>';
  }

  html += '<table><thead><tr><th>Term</th><th class="num">Subjects</th><th class="num">Average</th><th class="num">GPA</th><th>Grade Distribution</th></tr></thead><tbody>';
  terms.forEach((term) => {
    html += renderTermSummaryRowHTML(term.data.results, term.label);
  });

  const { grades: totalGrades, scores: totalScores } = getAllGradesForStudent(student);
  const cumulativeAvg = totalScores.length
    ? Math.round((totalScores.reduce((sum, score) => sum + Number(score), 0) / totalScores.length) * 100) / 100
    : null;
  const dist = {};
  totalGrades.forEach((grade) => { dist[grade] = (dist[grade] || 0) + 1; });
  const distStr = Object.keys(dist).sort().map((grade) => grade + " &times;" + dist[grade]).join(", ");
  const annualAverage = calculateCumulativeGPA(student);

  html += '<tr><td><strong>Cumulative</strong></td><td class="num">' + totalGrades.length + '</td>' +
    '<td class="num"><strong>' + (cumulativeAvg == null ? "&mdash;" : cumulativeAvg) + '</strong></td>' +
    '<td class="num"><strong>' + (annualAverage == null ? "&mdash;" : annualAverage) + '</strong></td>' +
    '<td><strong>' + (distStr || "&mdash;") + '</strong></td></tr>';
  html += '</tbody></table>';

  if (annualAverage != null) {
    const status = student.promotionStatus || calculatePromotionStatus(student);
    const notice = getPromotionNoticeData(status, annualAverage, student);
    const textColors = { promoted: "#3f7d55", on_try: "#b87a00", repeated: "#d9003b", not_promoted: "#d9003b", pending: "#b87a00" };
    const bgColors = { promoted: "#e5f3ea", on_try: "#fff3c4", repeated: "#ffe4ea", not_promoted: "#ffe4ea", pending: "#fff3c4" };
    const label = { promoted: "Promoted", on_try: "On Trial", repeated: "Repeating", not_promoted: "Not Promoted", pending: "Results Pending" }[status] || "";
    html += '<div class="gpa-box"><strong>Annual Average: ' + annualAverage + '%</strong>' +
      (label ? ' &middot; <span class="promo-badge" style="background:' + (bgColors[status] || "#fff3c4") + ';color:' + (textColors[status] || "#b87a00") + ';">' + label + '</span>' : '') +
      '<br><span style="color:#75697a;">' + escapeHtml(notice.title) + ' — ' + escapeHtml(notice.message) + '</span></div>';
  } else {
    html += '<div class="gpa-box"><strong>Annual Average:</strong> <span style="color:#75697a;">Results Pending — all three terms must be published.</span></div>';
  }

  return html;
}

function renderTermSummaryRowHTML(results, label) {
  const avg = calculateTermAverage(results);
  const gpa = calculateTermGPA(results);
  const dist = {};
  results.forEach((r) => {
    const grade = resultGrade(r);
    dist[grade] = (dist[grade] || 0) + 1;
  });
  const distStr = Object.keys(dist).sort().map((grade) => grade + " &times;" + dist[grade]).join(", ");
  return '<tr><td>' + escapeHtml(label) + '</td><td class="num">' + results.length + '</td>' +
    '<td class="num">' + (avg == null ? "&mdash;" : avg + "%") + '</td>' +
    '<td class="num">' + (gpa == null ? "&mdash;" : gpa) + '</td>' +
    '<td>' + (distStr || "&mdash;") + '</td></tr>';
}

function openPrintPreview(html, blockedMessage) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) { window.alert(blockedMessage); return false; }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(function () { printWindow.print(); }, 500);
  return true;
}

function renderResultsTableHTML(results, showRemark) {
  const list = Array.isArray(results) ? results : [];
  if (!list.length) return '<p class="empty">No results have been published for this term yet.</p>';
  let html = '<table><thead><tr><th>Subject</th><th class="num">Class Score</th><th class="num">Exam Score</th><th class="num">Total</th><th class="num">Grade</th>' +
    (showRemark ? '<th>Teacher&rsquo;s Remark</th>' : '') + '</tr></thead><tbody>';
  list.forEach((r) => {
    const classScore = Number(r.classScore || 0);
    const examScore = Number(r.examScore || 0);
    const total = resultTotal(r);
    const grade = resultGrade(r);
    html += "<tr><td><strong>" + escapeHtml(r.subject) + "</strong></td>" +
      '<td class="num">' + escapeHtml(classScore) + "</td>" +
      '<td class="num">' + escapeHtml(examScore) + "</td>" +
      '<td class="num"><strong>' + escapeHtml(total) + "</strong></td>" +
      '<td class="num">' + gradePillHTML(grade) + "</td>" +
      (showRemark ? '<td class="remark">' + escapeHtml(r.remark || "—") + "</td>" : "") + "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

function renderTermSummaryBox(results, label) {
  if (!results || !results.length) return "";
  const avg = calculateTermAverage(results);
  const gpa = calculateTermGPA(results);
  let dist = {};
  results.forEach((r) => {
    const g = r.grade || calculateGrade(r.totalScore || (Number(r.classScore || 0) + Number(r.examScore || 0)));
    dist[g] = (dist[g] || 0) + 1;
  });
  const distStr = Object.keys(dist).sort().map((g) => g + "×" + dist[g]).join(", ");
  return '<div class="gpa-box"><strong>' + label + ' Average: ' + (avg != null ? avg + "%" : "—") + '</strong> · <strong>GPA: ' + (gpa != null ? gpa : "—") + '</strong> · <span style="color:#75697a;">' + distStr + '</span></div>';
}

function gradePillHTML(grade) {
  const colors = { A: "#e5f3ea", B: "#fff3c4", C: "#ffe4ea", D: "#f3e7f7", E: "#ffe0e0", F: "#ffcccc" };
  const textColors = { A: "#3f7d55", B: "#b87a00", C: "#d9003b", D: "#560f75", E: "#b00", F: "#c00" };
  const bg = colors[grade] || "#ffe4ea";
  const tc = textColors[grade] || "#d9003b";
  return '<span class="grade-pill" style="background:' + bg + ';color:' + tc + ';">' + escapeHtml(grade) + '</span>';
}

