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

const DETLOF_CURRENCY = "GHS";

function detlofFormatCedis(amount) {
  const value = Number(amount) || 0;
  return DETLOF_CURRENCY + " " + value.toFixed(2);
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
