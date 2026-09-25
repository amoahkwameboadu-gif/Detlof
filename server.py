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
    {"fullName": "Kristen Denison Esoun", "email": "kristen.esoun@detlof.edu.gh", "studentId": "KG1-0001", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1001"},
    {"fullName": "Comfort Ewonam Akakpoh", "email": "comfort.akakpoh@detlof.edu.gh", "studentId": "KG1-0002", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1002"},
    {"fullName": "Marcus Kobby Prah", "email": "marcus.prah@detlof.edu.gh", "studentId": "KG1-0003", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1003"},
    {"fullName": "Doxa Egyapa Kobina Prah", "email": "doxa.prah@detlof.edu.gh", "studentId": "KG1-0004", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1004"},
    {"fullName": "Joseph Kudanu", "email": "joseph.kudanu@detlof.edu.gh", "studentId": "KG1-0005", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1005"},
    {"fullName": "Jesse Odoop", "email": "jesse.odom@detlof.edu.gh", "studentId": "KG1-0006", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1006"},
    {"fullName": "Elwy Xolarli Dzobo", "email": "elwy.dzobo@detlof.edu.gh", "studentId": "KG1-0007", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1007"},
    {"fullName": "Nhyiraba Brena", "email": "nhyiraba.brena@detlof.edu.gh", "studentId": "KG1-0008", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1008"},
    {"fullName": "Robert Anthony Esoun", "email": "robert.esoun@detlof.edu.gh", "studentId": "KG1-0009", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1009"},
    {"fullName": "Elora Aaryn Amoah", "email": "elora.amoah@detlof.edu.gh", "studentId": "KG1-0010", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1010"},
    {"fullName": "Fiifi Gabrab", "email": "fiifi.gabrab@detlof.edu.gh", "studentId": "KG1-0011", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1011"},
    {"fullName": "Reuben Amosah", "email": "reuben.amosah@detlof.edu.gh", "studentId": "KG1-0012", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1012"},
    {"fullName": "Warrick Oswald Ewua", "email": "warrick.ewua@detlof.edu.gh", "studentId": "KG1-0013", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1013"},
    {"fullName": "Giovanna Anim", "email": "giovanna.anim@detlof.edu.gh", "studentId": "KG1-0014", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1014"},
    {"fullName": "Gabriella Ammal", "email": "gabriella.ammal@detlof.edu.gh", "studentId": "KG1-0015", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1015"},
    {"fullName": "Zipporah Agyapong", "email": "zipporah.agyapong@detlof.edu.gh", "studentId": "KG1-0016", "currentClass": "KG 1", "academicYear": "2025 / 2026", "loginCode": "DET-1016"},
    {"fullName": "Napoleon Odehy Arkhrah", "email": "napoleon.arkhrah@detlof.edu.gh", "studentId": "KGB-0001", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2001"},
    {"fullName": "Kelvin Kwakyir Entsua", "email": "kelvin.entsua@detlof.edu.gh", "studentId": "KGB-0002", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2002"},
    {"fullName": "Edmund Fiifi Mensah", "email": "edmund.mensah@detlof.edu.gh", "studentId": "KGB-0003", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2003"},
    {"fullName": "Archibald Nii A. Quayson", "email": "archibald.quayson@detlof.edu.gh", "studentId": "KGB-0004", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2004"},
    {"fullName": "Eward Eloelo Agbetzi", "email": "eward.agbetzi@detlof.edu.gh", "studentId": "KGB-0005", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2005"},
    {"fullName": "Justin Quansah", "email": "justin.quansah@detlof.edu.gh", "studentId": "KGB-0006", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2006"},
    {"fullName": "Cyril T. Esselifie", "email": "cyril.esselifie@detlof.edu.gh", "studentId": "KGB-0007", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2007"},
    {"fullName": "Azzam Nsiya Zilkifilu", "email": "azzam.zilkifilu@detlof.edu.gh", "studentId": "KGB-0008", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2008"},
    {"fullName": "Benedict Borlabi Bortey", "email": "benedict.bortey@detlof.edu.gh", "studentId": "KGB-0009", "currentClass": "KG 2 Boys", "academicYear": "2025 / 2026", "loginCode": "DET-2009"},
    {"fullName": "Geovanna K. Arthur", "email": "geovanna.arthur@detlof.edu.gh", "studentId": "KGG-0001", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2010"},
    {"fullName": "Varnika A. Essel", "email": "varnika.essel@detlof.edu.gh", "studentId": "KGG-0002", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2011"},
    {"fullName": "Dominion Dadzie", "email": "dominion.dadzie@detlof.edu.gh", "studentId": "KGG-0003", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2012"},
    {"fullName": "Godjoy Asmah", "email": "godjoy.asmah@detlof.edu.gh", "studentId": "KGG-0004", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2013"},
    {"fullName": "Godpraise Asmah", "email": "godpraise.asmah@detlof.edu.gh", "studentId": "KGG-0005", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2014"},
    {"fullName": "Maya Britt Appiah", "email": "maya.appiah@detlof.edu.gh", "studentId": "KGG-0006", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2015"},
    {"fullName": "Henritta Star Arthur", "email": "henritta.arthur@detlof.edu.gh", "studentId": "KGG-0007", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2016"},
    {"fullName": "Patricia Dadzie", "email": "patricia.dadzie@detlof.edu.gh", "studentId": "KGG-0008", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2017"},
    {"fullName": "Ama Anokyeewaa Adusei", "email": "ama.adusei@detlof.edu.gh", "studentId": "KGG-0009", "currentClass": "KG 2 Girls", "academicYear": "2025 / 2026", "loginCode": "DET-2018"},
    {"fullName": "Percis Woode Agyapong Laorian Boso", "email": "percis.boso@detlof.edu.gh", "studentId": "NUR2-0001", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3001"},
    {"fullName": "Leon Kojo Afful", "email": "leon.afful@detlof.edu.gh", "studentId": "NUR2-0002", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3002"},
    {"fullName": "Leo Baijon Quansah", "email": "leo.quansah@detlof.edu.gh", "studentId": "NUR2-0003", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3003"},
    {"fullName": "Zana Akorful", "email": "zana.akorful@detlof.edu.gh", "studentId": "NUR2-0004", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3004"},
    {"fullName": "Anthony", "email": "anthony@detlof.edu.gh", "studentId": "NUR2-0005", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3005"},
    {"fullName": "Armstrong", "email": "armstrong@detlof.edu.gh", "studentId": "NUR2-0006", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3006"},
    {"fullName": "Zaid Adamu", "email": "zaid.adamu@detlof.edu.gh", "studentId": "NUR2-0007", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3007"},
    {"fullName": "Precious Essien", "email": "precious.essien@detlof.edu.gh", "studentId": "NUR2-0008", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3008"},
    {"fullName": "Elsie Abakah Mensah", "email": "elsie.mensah@detlof.edu.gh", "studentId": "NUR2-0009", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3009"},
    {"fullName": "Uzziah", "email": "uzziah@detlof.edu.gh", "studentId": "NUR2-0010", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3010"},
    {"fullName": "Blessed", "email": "blessed@detlof.edu.gh", "studentId": "NUR2-0011", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3011"},
    {"fullName": "Matthew Abakah", "email": "matthew.abakah@detlof.edu.gh", "studentId": "NUR2-0012", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3012"},
    {"fullName": "Destiny Tay", "email": "destiny.tay@detlof.edu.gh", "studentId": "NUR2-0013", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3013"},
    {"fullName": "Firdaus Baidoo", "email": "firdaus.baidoo@detlof.edu.gh", "studentId": "NUR2-0014", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3014"},
    {"fullName": "Marcel Isibu Thompson", "email": "marcel.thompson@detlof.edu.gh", "studentId": "NUR2-0015", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3015"},
    {"fullName": "Nhyira Edusei", "email": "nhyira.edusei@detlof.edu.gh", "studentId": "NUR2-0016", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3016"},
    {"fullName": "Eliana Mensah", "email": "eliana.mensah@detlof.edu.gh", "studentId": "NUR2-0017", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3017"},
    {"fullName": "Lara Mensah", "email": "lara.mensah@detlof.edu.gh", "studentId": "NUR2-0018", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3018"},
    {"fullName": "Laurian Danso", "email": "laurian.danso@detlof.edu.gh", "studentId": "NUR2-0019", "currentClass": "Nursery Two", "academicYear": "2025 / 2026", "loginCode": "DET-3019"},
    {"fullName": "Fiifi Sowyer", "email": "fiifi.sowyer@detlof.edu.gh", "studentId": "CRE-0001", "currentClass": "Creche", "academicYear": "2025 / 2026", "loginCode": "DET-4001"},
    {"fullName": "Nessa Jesusline Afful", "email": "nessa.afful@detlof.edu.gh", "studentId": "CRE-0002", "currentClass": "Creche", "academicYear": "2025 / 2026", "loginCode": "DET-4002"},
    {"fullName": "Kofi Moses", "email": "kofi.moses@detlof.edu.gh", "studentId": "CRE-0003", "currentClass": "Creche", "academicYear": "2025 / 2026", "loginCode": "DET-4003"},
    {"fullName": "Obrenpong", "email": "obrenpong@detlof.edu.gh", "studentId": "CRE-0004", "currentClass": "Creche", "academicYear": "2025 / 2026", "loginCode": "DET-4004"},
    {"fullName": "Enyimyam", "email": "enyiam@detlof.edu.gh", "studentId": "CRE-0005", "currentClass": "Creche", "academicYear": "2025 / 2026", "loginCode": "DET-4005"},
    {"fullName": "Thiery O. Ankrah", "email": "thiery.anrah@detlof.edu.gh", "studentId": "NUR1-0001", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5001"},
    {"fullName": "Ohemaa", "email": "ohemaa@detlof.edu.gh", "studentId": "NUR1-0002", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5002"},
    {"fullName": "Duo La", "email": "duola@detlof.edu.gh", "studentId": "NUR1-0003", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5003"},
    {"fullName": "Calista Obeng Appiah", "email": "calista.appiah@detlof.edu.gh", "studentId": "NUR1-0004", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5004"},
    {"fullName": "Naa Agele", "email": "naa.agele@detlof.edu.gh", "studentId": "NUR1-0005", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5005"},
    {"fullName": "Kendrick", "email": "kendrick@detlof.edu.gh", "studentId": "NUR1-0006", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5006"},
    {"fullName": "Janet", "email": "janet@detlof.edu.gh", "studentId": "NUR1-0007", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5007"},
    {"fullName": "Wisdom", "email": "wisdom@detlof.edu.gh", "studentId": "NUR1-0008", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5008"},
    {"fullName": "Zulaiha Ali", "email": "zulaiha.ali@detlof.edu.gh", "studentId": "NUR1-0009", "currentClass": "Nursery One", "academicYear": "2025 / 2026", "loginCode": "DET-5009"},
]

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
