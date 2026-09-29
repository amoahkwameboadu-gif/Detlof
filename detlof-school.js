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
// Subjects by level, following Ghana's standards-based curriculum.
//
//   Key Phase 1  Foundation      - Kindergarten 1 & 2
//   Key Phase 2  Lower Primary   - Basic 1 to Basic 3
//   Key Phase 3  Upper Primary   - Basic 4 to Basic 6
//   Key Phase 4  Junior High     - Basic 7 to Basic 9 (Common Core Programme)
//
// Language, Mathematics, Science, History, Our World and Our People, Creative
// Arts, Religious and Moral Education, Physical Education, French, Ghanaian
// Language and Computing are taught from 2019. Note that French and Computing
// begin at Basic 4, and Social Studies, Career Technology and Arabic begin at
// Basic 7 where the Common Core Programme applies.
// ---------------------------------------------------------------------------
const DETLOF_SUBJECTS_CRECHE = [
  "Play Activities",
  "Language & Literacy",
  "Numeracy",
  "Our World & People",
  "Creative Arts",
  "Physical Development",
];

const DETLOF_SUBJECTS_KINDERGARTEN = [
  "Numeracy",
  "Language & Literacy",
  "Our World & People",
  "Creative Arts",
  "Religious & Moral Education",
  "Physical Education",
];

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

const DETLOF_SUBJECTS_UPPER_PRIMARY = DETLOF_SUBJECTS_LOWER_PRIMARY.concat([
  "French",
  "Computing",
]);

const DETLOF_SUBJECTS_JUNIOR_HIGH = [
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
  "Physical Education and Health",
];

// Level groupings, used to resolve a class to its curriculum.
function detlofCurriculumKey(className) {
  const name = String(className || "");
  if (/^Basic\s*[1-3]$/.test(name)) return "lowerPrimary";
  if (/^Basic\s*[4-6]$/.test(name)) return "upperPrimary";
  if (/^Basic\s*[7-9]$/.test(name)) return "juniorHigh";
  if (/^JHS\s*[1-3]$/.test(name)) return "juniorHigh";
  if (/^SHS\s*[1-3]$/.test(name)) return "seniorHigh";
  if (/^KG/.test(name) || /Nursery/.test(name)) return "kindergarten";
  if (/^Creche$/i.test(name)) return "creche";
  if (/^Lower KG$/i.test(name) || /^Upper KG$/i.test(name)) return "kindergarten";
  return "lowerPrimary";
}

const DETLOF_CURRICULUM = {
  creche: { label: "Early Childhood Development", subjects: DETLOF_SUBJECTS_CRECHE },
  kindergarten: { label: "Key Phase 1 - Foundation", subjects: DETLOF_SUBJECTS_KINDERGARTEN },
  lowerPrimary: { label: "Key Phase 2 - Lower Primary (B1-B3)", subjects: DETLOF_SUBJECTS_LOWER_PRIMARY },
  upperPrimary: { label: "Key Phase 3 - Upper Primary (B4-B6)", subjects: DETLOF_SUBJECTS_UPPER_PRIMARY },
  juniorHigh: { label: "Key Phase 4 - Common Core Programme (B7-B9)", subjects: DETLOF_SUBJECTS_JUNIOR_HIGH },
  seniorHigh: { label: "Key Phase 5 - Senior High School", subjects: DETLOF_SUBJECTS_JUNIOR_HIGH.concat(["Elective Mathematics", "Elective Science", "Elective Humanities"]) },
};

// The subjects a given class actually teaches.
function detlofSubjectsForClass(className) {
  const key = detlofCurriculumKey(className);
  const entry = DETLOF_CURRICULUM[key] || DETLOF_CURRICULUM.lowerPrimary;
  return entry.subjects.slice();
}

function detlofCurriculumLabel(className) {
  const key = detlofCurriculumKey(className);
  return (DETLOF_CURRICULUM[key] || DETLOF_CURRICULUM.lowerPrimary).label;
}

// Every subject any level teaches, for free-text entry and custom templates.
function detlofAllSubjects() {
  const seen = [];
  Object.keys(DETLOF_CURRICULUM).forEach((key) => {
    DETLOF_CURRICULUM[key].subjects.forEach((subject) => {
      if (seen.indexOf(subject) === -1) seen.push(subject);
    });
  });
  return seen;
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
