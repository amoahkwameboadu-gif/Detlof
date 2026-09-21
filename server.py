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
                return data
        except Exception:
            pass
    return [dict(s) for s in DEFAULT_STUDENTS]


def save_students():
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as handle:
            json.dump(STUDENTS, handle, indent=2, ensure_ascii=False)
    except Exception:
        pass


STUDENTS = load_students()


def find_student(email, student_id, password):
    email = email.strip().lower()
    student_id = student_id.strip().upper()
    password = password.strip()
    for student in STUDENTS:
        if (
            student["email"].strip().lower() == email
            and student["studentId"].strip().upper() == student_id
            and student["loginCode"].strip() == password
        ):
            return student
    return None


def merge_student(incoming):
    sid = str(incoming.get("studentId", "")).strip().upper()
    for index, student in enumerate(STUDENTS):
        if student["studentId"].strip().upper() == sid:
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
    email = data.get("email", "")
    student_id = data.get("studentId", "")
    password = data.get("password", "")

    student = find_student(email, student_id, password)
    if student:
        return jsonify({"student": student})

    synced = data.get("syncedRecord")
    if (
        isinstance(synced, dict)
        and synced.get("studentId", "").strip().upper() == student_id.strip().upper()
        and synced.get("email", "").strip().lower() == email.strip().lower()
        and str(synced.get("loginCode", "")).strip() == password.strip()
    ):
        existing = find_student(synced.get("email", ""), synced.get("studentId", ""), synced.get("loginCode", ""))
        if existing is None:
            saved = merge_student(dict(synced))
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
