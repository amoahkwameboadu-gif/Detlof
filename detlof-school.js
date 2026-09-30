// Detlof Preparatory School — shared school reference data and billing helpers.
// Loaded by both the admin portal and the student portal so a fee item, club or
// compound is spelled and valued the same way on both sides.

// Where a student lives / how they come to school.
const DETLOF_COMPOUNDS = [
  "Day Students",
  "Atabaze",
  "Chapel Square",
  "Zongo",
  "Pleshie",
  "Bantuma",
  "Agona",
  "Boarding House",
];

// Clubs and activities a student can belong to.
const DETLOF_CLUBS = [
  "Football", "Athletics", "Debate", "Choir", "Drama", "Cadet Corps",
  "Science Club", "Chess", "Art & Craft", "Music", "ICT Club", "Reading Club",
];

// Fee heads billed to every family.
const DETLOF_FEE_ITEMS = [
  "School Fees",
  "Feeding Fees",
  "Club Dues",
];

// ---------------------------------------------------------------------------
// School structure, curriculum and assessment.
//
// Reference: NaCCA (nacca.gov.gh) Ghanaian curriculum.
//   Key Phase 1  Foundation      - KG 1 and KG 2
//   Key Phase 2  Lower Primary   - Basic 1 to Basic 3
//   Key Phase 3  Upper Primary   - Basic 4 to Basic 6
//   Key Phase 4  Junior High     - JHS 1 to JHS 3, the Common Core Programme
//
// The school runs from Pre-school (Creche) through to JHS 3.
// ---------------------------------------------------------------------------

// Pre-school: play-based early childhood, no graded subjects or exams.
const DETLOF_SUBJECTS_PRE_SCHOOL = [
  "Play & Language Development",
  "Early Numeracy",
  "Fine & Gross Motor Skills",
  "Social & Emotional Skills",
  "Creative Expression",
  "Health, Hygiene & Safety",
];

// KG 1: the four KG subjects NaCCA names, plus RME and Physical Education.
const DETLOF_SUBJECTS_KG1 = [
  "Numeracy",
  "Language & Literacy",
  "Our World & People",
  "Creative Art",
  "Religious & Moral Education",
  "Physical Education",
];

// KG 2 adds Coding and Programming, which NaCCA places in the upper KG.
const DETLOF_SUBJECTS_KG2 = DETLOF_SUBJECTS_KG1.concat(["Coding & Programming"]);

// Key Phase 2, Lower Primary. French and Computing start at Basic 4.
const DETLOF_SUBJECTS_LOWER_PRIMARY = [
  "English Language",
  "Mathematics",
  "Science",
  "Ghanaian Language",
  "History",
  "Our World and Our People",
  "Creative Arts",
  "Religious and Moral Education",
  "Physical Education",
];

// Key Phase 3, Upper Primary.
const DETLOF_SUBJECTS_UPPER_PRIMARY = DETLOF_SUBJECTS_LOWER_PRIMARY.concat([
  "French",
  "Computing",
]);

// Key Phase 4, the Common Core Programme's nine learning areas.
const DETLOF_SUBJECTS_JHS = [
  "English Language",
  "Mathematics",
  "Science",
  "Social Studies",
  "Computing",
  "Ghanaian Language",
  "French",
  "Creative Arts and Design",
  "Career Technology",
  "Religious and Moral Education",
  "Physical and Health Education",
];

function detlofCurriculumKey(className) {
  const name = String(className || "").trim();
  if (/^Creche$/i.test(name)) return "preSchool";
  if (/^KG\s*1$/i.test(name)) return "kg1";
  if (/^KG\s*2$/i.test(name)) return "kg2";
  if (/^Basic\s*[1-3]$/i.test(name)) return "lowerPrimary";
  if (/^Basic\s*[4-6]$/i.test(name)) return "upperPrimary";
  if (/^JHS\s*[1-3]$/i.test(name)) return "juniorHigh";
  return "lowerPrimary";
}

const DETLOF_CURRICULUM = {
  preSchool: { label: "Pre-school (Early Childhood Development)", subjects: DETLOF_SUBJECTS_PRE_SCHOOL, assessment: "continuous" },
  kg1: { label: "Key Phase 1 - Foundation, KG 1", subjects: DETLOF_SUBJECTS_KG1, assessment: "continuous" },
  kg2: { label: "Key Phase 1 - Foundation, KG 2", subjects: DETLOF_SUBJECTS_KG2, assessment: "continuous" },
  lowerPrimary: { label: "Key Phase 2 - Lower Primary (Basic 1-3)", subjects: DETLOF_SUBJECTS_LOWER_PRIMARY, assessment: "exam" },
  upperPrimary: { label: "Key Phase 3 - Upper Primary (Basic 4-6)", subjects: DETLOF_SUBJECTS_UPPER_PRIMARY, assessment: "exam" },
  juniorHigh: { label: "Key Phase 4 - Common Core Programme (JHS 1-3)", subjects: DETLOF_SUBJECTS_JHS, assessment: "exam" },
};

function detlofSubjectsForClass(className) {
  return DETLOF_CURRICULUM[detlofCurriculumKey(className)].subjects.slice();
}

function detlofCurriculumLabel(className) {
  return DETLOF_CURRICULUM[detlofCurriculumKey(className)].label;
}

function detlofAllSubjects() {
  const seen = [];
  Object.keys(DETLOF_CURRICULUM).forEach((key) => {
    DETLOF_CURRICULUM[key].subjects.forEach((subject) => {
      if (seen.indexOf(subject) === -1) seen.push(subject);
    });
  });
  return seen;
}

// Pre-school and KG are assessed continuously, not by a class/exam split, so
// the score fields a class needs must change with the level.
const DETLOF_ASSESSMENT = {
  continuous: {
    mode: "continuous",
    scoreLabel: "Continuous Assessment Score",
    scoreMax: 100,
    exam: false,
    bands: ["Emerging", "Developing", "Achieving", "Exceeding"],
    note: "Pre-school and KG are assessed through continuous observation. There is no separate exam score.",
  },
  exam: {
    mode: "exam",
    scoreLabel: "Class Score",
    scoreMax: 40,
    exam: true,
    bands: ["A", "B", "C", "D", "E", "F"],
    note: "Class work is weighted 40 and the end of term exam 60.",
  },
};

function detlofAssessmentFor(className) {
  return DETLOF_ASSESSMENT[DETLOF_CURRICULUM[detlofCurriculumKey(className)].assessment];
}

// The terminal class on the school's ladder.
const DETLOF_TOP_CLASS = "JHS 3";

function detlofNextClassFor(className) {
  const ladder = [
    "Creche", "KG 1", "KG 2",
    "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6",
    "JHS 1", "JHS 2", "JHS 3",
  ];
  const i = ladder.indexOf(String(className || "").trim());
  if (i === -1 || i >= ladder.length - 1) return className;
  return ladder[i + 1];
}

const DETLOF_CURRENCY = "GHS";
const DETLOF_CURRENCY_SYMBOL = "₵"; // cedi sign
const DETLOF_CURRENCY_NAME = "Ghana Cedi";
const DETLOF_PESEWA_PER_CEDI = 100;

// Thousands grouping written out rather than delegated to Intl, because the
// "en-GH" locale is not present in every runtime and silently drops the commas.
function detlofGroupThousands(digits) {
  const negative = digits.charAt(0) === "-";
  const body = negative ? digits.slice(1) : digits;
  const grouped = body.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? "-" + grouped : grouped;
}

function detlofDecimal(value) {
  const fixed = (Number(value) || 0).toFixed(2);
  const parts = fixed.split(".");
  // Group the whole part only; the decimals must be preserved exactly.
  return detlofGroupThousands(parts[0]) + "." + (parts[1] || "00");
}

// Grouped money in the Ghana Cedi. "GHS" is used rather than the cedi sign
// because it renders on every device and is what Ghanaian receipts carry.
function detlofFormatCedis(amount) {
  return DETLOF_CURRENCY + " " + detlofDecimal(Number(amount) || 0);
}

// The same amount expressed in pesewas, for receipt line items.
function detlofFormatPesewas(amount) {
  const pesewas = Math.round((Number(amount) || 0) * DETLOF_PESEWA_PER_CEDI);
  return detlofGroupThousands(String(Math.abs(pesewas))) + " pesewas";
}

// Spell the amount out in words, as a formal receipt requires.
const AMOUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS_WORDS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function detlofNumberToWords(value) {
  const number = Math.floor(Math.abs(Number(value) || 0));
  if (number === 0) return "Zero";
  const underThousand = (n) => {
    if (n < 20) return AMOUNT_WORDS[n];
    if (n < 100) return TENS_WORDS[Math.floor(n / 10)] + (n % 10 ? " " + AMOUNT_WORDS[n % 10] : "");
    return AMOUNT_WORDS[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + underThousand(n % 100) : "");
  };
  const parts = [];
  const millions = Math.floor(number / 1000000);
  const thousands = Math.floor((number % 1000000) / 1000);
  const rest = number % 1000;
  if (millions) parts.push(underThousand(millions) + " Million");
  if (thousands) parts.push(underThousand(thousands) + " Thousand");
  if (rest) parts.push(underThousand(rest));
  return parts.join(" ");
}

function detlofAmountInWords(amount) {
  const value = Number(amount) || 0;
  if (!value) return "Zero";
  const cedis = Math.floor(Math.abs(value));
  const pesewas = Math.round((Math.abs(value) - cedis) * DETLOF_PESEWA_PER_CEDI);
  const cediPart = detlofNumberToWords(cedis) + (cedis === 1 ? " Cedi" : " Cedis");
  if (!pesewas) return cediPart + " only";
  return cediPart + " and " + detlofNumberToWords(pesewas) + (pesewas === 1 ? " Pesewa" : " Pesewas");
}

function detlofFeeStatus(bill) {
  const amount = Number(bill && bill.amount) || 0;
  const paid = Number(bill && bill.paid) || 0;
  if (amount <= 0) return "Not Applicable";
  if (paid <= 0) return "Owing";
  if (paid >= amount) return "Paid";
  return "Part Paid";
}

function detlofBillBalance(bill) {
  return Math.max(0, (Number(bill && bill.amount) || 0) - (Number(bill && bill.paid) || 0));
}

function detlofBills(student) {
  return Array.isArray(student && student.bills) ? student.bills : [];
}

// Always returns one entry per standard fee head, plus any custom ones added later.
function detlofNormaliseBills(student) {
  const existing = detlofBills(student);
  const byItem = new Map();
  existing.forEach((bill) => {
    if (bill && bill.item) byItem.set(String(bill.item), bill);
  });
  const list = DETLOF_FEE_ITEMS.map((item) => Object.assign(
    { item: item, amount: 0, paid: 0, note: "" },
    byItem.get(item) || {}
  ));
  byItem.forEach((bill, item) => {
    if (DETLOF_FEE_ITEMS.indexOf(item) === -1) list.push(Object.assign({ amount: 0, paid: 0, note: "" }, bill));
  });
  return list;
}

function detlofBillTotals(student) {
  const list = detlofNormaliseBills(student);
  let billed = 0;
  let paid = 0;
  list.forEach((bill) => {
    billed += Number(bill.amount) || 0;
    paid += Number(bill.paid) || 0;
  });
  const balance = Math.max(0, billed - paid);
  return {
    bills: list,
    billed: billed,
    paid: paid,
    balance: balance,
    status: billed <= 0 ? "Not Applicable" : paid <= 0 ? "Owing" : paid >= billed ? "Paid" : "Part Paid",
  };
}

function detlofFindBill(student, item) {
  return detlofNormaliseBills(student).find((bill) => String(bill.item) === String(item)) || null;
}

// Applies edited amounts/paid values back onto a student record.
function detlofApplyBills(student, edited) {
  const merged = new Map();
  detlofNormaliseBills(student).forEach((bill) => merged.set(String(bill.item), Object.assign({}, bill)));
  (edited || []).forEach((bill) => {
    if (!bill || !bill.item) return;
    const key = String(bill.item);
    const previous = merged.get(key) || { item: bill.item, note: "" };
    merged.set(key, {
      item: bill.item,
      amount: Math.max(0, Number(bill.amount) || 0),
      paid: Math.max(0, Number(bill.paid) || 0),
      note: bill.note == null ? (previous.note || "") : String(bill.note),
    });
  });
  student.bills = Array.from(merged.values());
  return student;
}

const BILL_STATUS_COLOURS = {
  "Paid": { bg: "#e5f3ea", fg: "#3f7d55" },
  "Part Paid": { bg: "#fff3c4", fg: "#b87a00" },
  "Owing": { bg: "#ffe4ea", fg: "#d9003b" },
  "Not Applicable": { bg: "#f1f5f9", fg: "#64748b" },
};
