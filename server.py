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

DEFAULT_STUDENTS = [
    {
        "fullName": "Eliana Ama Owusu",
        "email": "eliana.owusu@detlof.edu.gh",
        "studentId": "DPS-24-0187",
        "currentClass": "JHS 2",
        "academicYear": "2024 / 2025",
        "loginCode": "Detlof2025!",
    },
    {
        "fullName": "Abena Osei",
        "email": "abena.osei@detlof.edu.gh",
        "studentId": "DPS-25-0301",
        "currentClass": "JHS 1",
        "academicYear": "2024 / 2025",
        "loginCode": "DET-3019",
    },
    {
        "fullName": "Kojo Antwi",
        "email": "kojo.antwi@detlof.edu.gh",
        "studentId": "DPS-25-0302",
        "currentClass": "Basic 5",
        "academicYear": "2024 / 2025",
        "loginCode": "DET-5028",
    },
]

RESULTS = [
    {"subject": "Mathematics", "classScore": 35, "examScore": 55, "totalScore": 90, "grade": "A", "remark": "Excellent progress"},
    {"subject": "English Language", "classScore": 32, "examScore": 50, "totalScore": 82, "grade": "A", "remark": "Very good"},
    {"subject": "Integrated Science", "classScore": 28, "examScore": 48, "totalScore": 76, "grade": "B", "remark": "Keep it up"},
    {"subject": "Computing / ICT", "classScore": 30, "examScore": 45, "totalScore": 75, "grade": "B", "remark": "Good work"},
    {"subject": "Social Studies", "classScore": 27, "examScore": 44, "totalScore": 71, "grade": "B", "remark": "Good effort"},
]

ANNOUNCEMENTS = [
    {"title": "Mid-term assessments begin next Monday", "category": "School Notice", "date": "May 14, 2025", "body": "Please check the assessment schedule and bring your required materials each day."},
    {"title": "Science has moved to the Science Lab", "category": "Timetable Update", "date": "May 9, 2025", "body": "Wednesday science lessons will take place in the Science Lab from 10:30 AM."},
    {"title": "Term 2 results are now available", "category": "Results Update", "date": "May 7, 2025", "body": "Your latest academic results have been published."},
]


def load_students():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as handle:
                data = json.load(handle)
            if isinstance(data, list):
                return [normalize_student(dict(item)) for item in data if isinstance(item, dict)]
        except Exception:
            pass
    return [normalize_student(dict(s)) for s in DEFAULT_STUDENTS]


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


def normalize_student(incoming):
    student = dict(incoming or {})
    parent_phone = str(student.get("parentPhone") or student.get("profileParentPhone") or "").strip()
    whatsapp_number = str(student.get("whatsappNumber") or student.get("profileWhatsApp") or "").strip()
    student["parentPhone"] = parent_phone
    student["profileParentPhone"] = parent_phone
    student["whatsappNumber"] = whatsapp_number
    student["profileWhatsApp"] = whatsapp_number
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


@app.route("/api/announcements")
def announcements():
    return jsonify(ANNOUNCEMENTS)


if __name__ == "__main__":
    app.run(debug=True)
