"""
DETLOF PREPARATORY SCHOOL — STUDENT PORTAL (PYTHON BACKEND)
--------------------------------------------------------------------------
The original file (detlof-student-portal.html) had no Python in it — it's a
pure client-side page that checks logins with JavaScript + localStorage, and
optionally calls a "/api/auth/login" endpoint if a real server is running.

This file is that real server, written in Python with Flask. It stores the
SAME student data as script.js, and answers the exact "/api/auth/login"
request that script.js already sends — so you can run this instead of (or
alongside) the localStorage-only version for a real login check.

How to run it:
  1. Install Flask:   pip install flask
  2. Start the server: python server.py
  3. Open your browser to: http://127.0.0.1:5000
     (it serves detlof-student-portal.html, style.css, script.js and the admin page for you)
"""

from flask import Flask, jsonify, request, send_from_directory
import os
import json

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "detlof_data.json")
app = Flask(__name__, static_folder=".", static_url_path="")


@app.after_request
def allow_local_portal_api(response):
    if request.path.startswith("/api/"):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

ROSTER_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "detlof_roster.json")

FALLBACK_CLASS_ORDER = [
    "Creche", "Nursery One", "Nursery Two", "KG 1", "KG 2 Boys", "KG 2 Girls",
    "Lower KG", "Upper KG",
    "Basic 1 Boys", "Basic 1 Girls", "Basic 2 Boys", "Basic 2 Girls",
    "Basic 3 Boys", "Basic 3 Girls", "Basic 4 Boys", "Basic 4 Girls",
    "Basic 5 Boys", "Basic 5 Girls", "Basic 6 Boys", "Basic 6 Girls",
    "Basic 7 Boys", "Basic 7 Girls", "Basic 8 Boys", "Basic 8 Girls",
    "Basic 9 Boys", "Basic 9 Girls",
    "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3",
]


def load_roster():
    """Read the shared roster (detlof_roster.json) used by every portal."""
    try:
        with open(ROSTER_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict) and isinstance(data.get("students"), list) and data["students"]:
            return data
    except Exception:
        pass
    return {"academicYear": "2025 / 2026", "classOrder": FALLBACK_CLASS_ORDER, "students": []}


ROSTER = load_roster()
ACADEMIC_YEAR = ROSTER.get("academicYear", "2025 / 2026")
CLASS_ORDER = ROSTER.get("classOrder") or FALLBACK_CLASS_ORDER
CLASS_ROSTER = ROSTER.get("classRoster") or {}

# Starting results, identical to the browser portals (detlof-report.js) so a
# student sees the same thing whether the API or localStorage answers.
DEFAULT_RESULTS = [
    {"subject": "Mathematics", "classScore": 32, "examScore": 56, "totalScore": 88, "grade": "B", "remark": "Very good"},
    {"subject": "English Language", "classScore": 34, "examScore": 60, "totalScore": 94, "grade": "A", "remark": "Excellent progress"},
    {"subject": "Integrated Science", "classScore": 30, "examScore": 55, "totalScore": 85, "grade": "B", "remark": "Keep it up"},
    {"subject": "Computing / ICT", "classScore": 28, "examScore": 50, "totalScore": 78, "grade": "C", "remark": "Good work"},
    {"subject": "Social Studies", "classScore": 30, "examScore": 52, "totalScore": 82, "grade": "B", "remark": "Good effort"},
]

# Profile fields the administrator maintains; the API must not drop them.
PROFILE_FIELDS = [
    "fullName", "email", "currentClass", "academicYear", "gender", "dateOfBirth",
    "bloodGroup", "parentName", "parentRelation", "parentPhone", "profileParentPhone",
    "whatsappNumber", "profileWhatsApp", "parentEmail", "emergencyContact",
    "homeAddress", "allergies", "interests", "adminNotes", "profilePic", "loginCode",
]


def seed_default_results(students):
    """Give every roster student the same starting First Term results."""
    seeded = []
    for student in students:
        record = dict(student)
        term_results = dict(record.get("termResults") or {})
        if not term_results.get("term1"):
            term_results["term1"] = {
                "results": [dict(row) for row in DEFAULT_RESULTS],
                "gpa": None,
                "subjectCount": len(DEFAULT_RESULTS),
            }
        record["termResults"] = term_results
        seeded.append(record)
    return seeded


DEFAULT_STUDENTS = seed_default_results(ROSTER.get("students") or [])


RESULTS = [
    {"subject": "Mathematics", "classScore": 32, "examScore": 56, "totalScore": 88, "grade": "B", "remark": "Very good"},
    {"subject": "English Language", "classScore": 34, "examScore": 60, "totalScore": 94, "grade": "A", "remark": "Excellent progress"},
    {"subject": "Integrated Science", "classScore": 30, "examScore": 55, "totalScore": 85, "grade": "B", "remark": "Keep it up"},
    {"subject": "Computing / ICT", "classScore": 28, "examScore": 50, "totalScore": 78, "grade": "C", "remark": "Good work"},
    {"subject": "Social Studies", "classScore": 30, "examScore": 52, "totalScore": 82, "grade": "B", "remark": "Good effort"},
]

ANNOUNCEMENTS = [
    {"title": "Term 3 assessments begin next Monday", "category": "School Notice", "date": "May 14, 2026", "body": "Please check the assessment schedule and bring your required materials each day."},
    {"title": "Science has moved to the Science Lab", "category": "Timetable Update", "date": "May 9, 2026", "body": "Wednesday science lessons will take place in the Science Lab from 10:30 AM."},
    {"title": "Term 3 results are now available", "category": "Results Update", "date": "May 7, 2026", "body": "Your latest academic results have been published."},
]


def load_students():
    """Seed the full official roster, then overlay anything previously saved."""
    merged = {}
    order = []
    for student in DEFAULT_STUDENTS:
        sid = str(student.get("studentId", "")).strip().upper()
        if not sid:
            continue
        merged[sid] = dict(student)
        order.append(sid)

    stored = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as handle:
                data = json.load(handle)
            if isinstance(data, list):
                stored = [item for item in data if isinstance(item, dict)]
        except Exception:
            stored = []

    for item in stored:
        sid = str(item.get("studentId", "")).strip().upper()
        if not sid:
            continue
        if sid in merged:
            merged[sid].update(item)
        else:
            merged[sid] = dict(item)
            order.append(sid)

    return [normalize_student(merged[sid]) for sid in order]


def save_students():
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as handle:
            json.dump(STUDENTS, handle, indent=2, ensure_ascii=False)
    except Exception:
        pass



def find_student(email, student_id, password):
    email = str(email).strip().lower()
    student_id = str(student_id).strip().upper()
    password = str(password).strip()
    for student in STUDENTS:
        if (
            str(student.get("email", "")).strip().lower() == email and
            str(student.get("studentId", "")).strip().upper() == student_id and
            str(student.get("loginCode", "")).strip() == password
        ):
            return normalize_student(student)
    return None


def normalize_name(name):
    return " ".join(str(name or "").split()).upper()


def roster_lookup(name=None, student_id=None):
    """Return the official roster record for a name or Student ID, if one exists."""
    if student_id:
        wanted_id = str(student_id).strip().upper()
        for student in DEFAULT_STUDENTS:
            if str(student.get("studentId", "")).strip().upper() == wanted_id:
                return student
    if not name:
        return None
    wanted = normalize_name(name)
    for student in DEFAULT_STUDENTS:
        if normalize_name(student.get("fullName")) == wanted:
            return student
    return None


def normalize_student(incoming):
    student = dict(incoming or {})
    parent_phone = str(student.get("parentPhone") or student.get("profileParentPhone") or "").strip()
    whatsapp_number = str(student.get("whatsappNumber") or student.get("profileWhatsApp") or "").strip()
    student["parentPhone"] = parent_phone
    student["profileParentPhone"] = parent_phone
    student["whatsappNumber"] = whatsapp_number
    student["profileWhatsApp"] = whatsapp_number
    roster = roster_lookup(student.get("fullName"), student.get("studentId"))
    if roster:
        # Keep the official roster spelling and class on every record.
        student["fullName"] = roster["fullName"]
        if not student.get("currentClass"):
            student["currentClass"] = roster.get("currentClass", "")
    return student


STUDENTS = [normalize_student(dict(s)) for s in load_students()]


def merge_student(incoming):
    incoming = normalize_student(incoming)
    sid = str(incoming.get("studentId", "")).strip().upper()
    for index, student in enumerate(STUDENTS):
        if str(student.get("studentId", "")).strip().upper() == sid:
            existing_parent_phone = str(student.get("parentPhone") or student.get("profileParentPhone") or "").strip()
            existing_whatsapp = str(student.get("whatsappNumber") or student.get("profileWhatsApp") or "").strip()
            incoming_parent_phone = str(incoming.get("parentPhone") or incoming.get("profileParentPhone") or "").strip()
            incoming_whatsapp = str(incoming.get("whatsappNumber") or incoming.get("profileWhatsApp") or "").strip()
            if not incoming_parent_phone and existing_parent_phone:
                incoming["parentPhone"] = existing_parent_phone
                incoming["profileParentPhone"] = existing_parent_phone
            if not incoming_whatsapp and existing_whatsapp:
                incoming["whatsappNumber"] = existing_whatsapp
                incoming["profileWhatsApp"] = existing_whatsapp
            student.update(incoming)
            student["studentId"] = sid
            return student
    incoming["studentId"] = sid
    STUDENTS.append(incoming)
    return incoming


# ==========================================================================
# ROUTES
# ==========================================================================

@app.route("/")
def home():
    return send_from_directory(".", "detlof-student-portal.html")


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    student_id = str(data.get("studentId", "")).strip().upper()
    password = str(data.get("password", "")).strip()

    student = find_student(email, student_id, password)
    if student:
        return jsonify({"student": student})

    synced = normalize_student(data.get("syncedRecord"))
    if (
        isinstance(synced, dict)
        and str(synced.get("studentId", "")).strip().upper() == student_id.strip().upper() and
        str(synced.get("email", "")).strip().lower() == email.strip().lower() and
        str(synced.get("loginCode", "")).strip() == password.strip()
    ):
        existing = find_student(synced.get("email", ""), synced.get("studentId", ""), synced.get("loginCode", ""))
        if existing is None:
            saved = merge_student(synced)
            save_students()
            return jsonify({"student": saved})
        return jsonify({"student": existing})

    return jsonify({"error": "Invalid email, student ID, or login code."}), 401


@app.route("/api/admin/bulk-import", methods=["POST"])
def bulk_import():
    data = request.get_json(silent=True) or {}
    incoming = data.get("students", [])
    if not isinstance(incoming, list):
        return jsonify({"error": "students must be a list."}), 400
    for student in incoming:
        if isinstance(student, dict) and student.get("studentId"):
            merge_student(student)
    save_students()
    return jsonify({"students": STUDENTS})


@app.route("/api/admin/student-update", methods=["POST"])
def student_update():
    data = request.get_json(silent=True) or {}
    student = data.get("student")
    if not isinstance(student, dict) or not student.get("studentId"):
        return jsonify({"error": "Invalid student payload."}), 400
    saved = merge_student(student)
    save_students()
    return jsonify({"student": saved})


@app.route("/api/results")
def results():
    return jsonify(RESULTS)


@app.route("/api/roster")
def roster():
    """Expose the official roster so the browser portals can stay in sync."""
    return jsonify(ROSTER)


@app.route("/api/announcements")
def announcements():
    return jsonify(ANNOUNCEMENTS)


if __name__ == "__main__":
    app.run(debug=True)
