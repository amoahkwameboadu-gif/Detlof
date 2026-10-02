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
  1. Create the permanent administrator: python server.py setup-admin
     Use role "admin" or "academic_admin" when prompted. Passwords are entered
     through a hidden prompt and stored only as password hashes.
  2. Start the server: python server.py
  3. Open your browser to: http://127.0.0.1:5000
  4. Reset an account offline when needed: python server.py reset-admin-password EMAIL

The signed-session key is generated once in the private instance/ directory.
Set DETLOF_COOKIE_SECURE=1 when serving the site over HTTPS.
"""

from datetime import datetime, timedelta, timezone
from functools import wraps
from getpass import getpass
from flask import Flask, jsonify, request, send_from_directory, session
import copy
import os
import json
import re
import secrets
import sys
import threading
from werkzeug.security import check_password_hash, generate_password_hash

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(APP_DIR, "detlof_data.json")
INSTANCE_DIR = os.path.join(APP_DIR, "instance")
SESSION_KEY_FILE = os.path.join(INSTANCE_DIR, "session.key")
STORE_LOCK = threading.RLock()
app = Flask(__name__, static_folder=".", static_url_path="")


def load_or_create_session_key():
    configured_key = os.environ.get("DETLOF_SECRET_KEY")
    if configured_key:
        return configured_key
    os.makedirs(INSTANCE_DIR, exist_ok=True)
    try:
        with open(SESSION_KEY_FILE, "r", encoding="utf-8") as handle:
            return handle.read().strip()
    except FileNotFoundError:
        key = secrets.token_hex(32)
        try:
            with open(SESSION_KEY_FILE, "x", encoding="utf-8") as handle:
                handle.write(key)
        except FileExistsError:
            with open(SESSION_KEY_FILE, "r", encoding="utf-8") as handle:
                return handle.read().strip()
        return key


app.config.update(
    SECRET_KEY=load_or_create_session_key(),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("DETLOF_COOKIE_SECURE") == "1",
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
)


@app.before_request
def prevent_private_store_downloads():
    private_paths = (
        "/detlof_data.json",
        "/detlof_data.json.tmp",
        "/detlof_roster.json",
        "/.env",
    )
    private_directories = ("/.git/", "/.venv/", "/.vscode/", "/__pycache__/", "/instance/")
    if request.path in private_paths or any(request.path.startswith(prefix) for prefix in private_directories):
        return jsonify({"error": "Not found."}), 404


@app.after_request
def disable_private_response_caching(response):
    if request.path.startswith("/api/admin/") or request.path == "/api/auth/login":
        response.headers["Cache-Control"] = "no-store"
    return response


ROSTER_FILE = os.path.join(APP_DIR, "detlof_roster.json")

FALLBACK_CLASS_ORDER = [
    "Creche",
    "KG 1",
    "KG 2",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
]


def load_roster():
    """Read the shared roster (detlof_roster.json) used by every portal."""
    if not os.path.exists(ROSTER_FILE):
        return {"academicYear": "2025 / 2026", "classOrder": FALLBACK_CLASS_ORDER, "students": []}
    try:
        with open(ROSTER_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict) and isinstance(data.get("students"), list) and data["students"]:
            return data
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError("Could not load the official student roster: " + str(error)) from error
    raise RuntimeError("The official student roster has no student list.")


ROSTER = load_roster()
ACADEMIC_YEAR = ROSTER.get("academicYear", "2025 / 2026")
CLASS_ORDER = ROSTER.get("classOrder") or FALLBACK_CLASS_ORDER
CLASS_ROSTER = ROSTER.get("classRoster") or {}

# Pre-school and KG are assessed continuously, so there is no separate exam score.
CONTINUOUS_ASSESSMENT_KEYS = ("preSchool", "kg1", "kg2")

# Subjects per key phase. Source: NaCCA Ghanaian curriculum, key phases 1 to 4.
PRE_SCHOOL_SUBJECTS = [
    "Play & Language Development",
    "Early Numeracy",
    "Fine & Gross Motor Skills",
    "Social & Emotional Skills",
    "Creative Expression",
    "Health, Hygiene & Safety",
]
KG1_SUBJECTS = [
    "Numeracy",
    "Language & Literacy",
    "Our World & People",
    "Creative Art",
    "Religious & Moral Education",
    "Physical Education",
]
KG2_SUBJECTS = KG1_SUBJECTS + ["Coding & Programming"]
LOWER_PRIMARY_SUBJECTS = [
    "English Language",
    "Mathematics",
    "Science",
    "Ghanaian Language",
    "History",
    "Our World and Our People",
    "Creative Arts",
    "Religious and Moral Education",
    "Physical Education",
]
UPPER_PRIMARY_SUBJECTS = LOWER_PRIMARY_SUBJECTS + ["French", "Computing"]
JHS_SUBJECTS = [
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
]

CURRICULUM = {
    "preSchool": PRE_SCHOOL_SUBJECTS,
    "kg1": KG1_SUBJECTS,
    "kg2": KG2_SUBJECTS,
    "lowerPrimary": LOWER_PRIMARY_SUBJECTS,
    "upperPrimary": UPPER_PRIMARY_SUBJECTS,
    "juniorHigh": JHS_SUBJECTS,
}

# Pre-school and KG are assessed continuously, so there is no separate exam score.
CONTINUOUS_ASSESSMENT_KEYS = ("preSchool", "kg1", "kg2")


def curriculum_key(class_name):
    """Which key phase a class belongs to. Mirrors detlof-school.js."""
    name = (class_name or "").strip().lower()
    if name == "creche":
        return "preSchool"
    if re.match(r"^kg\s*1$", name):
        return "kg1"
    if re.match(r"^kg\s*2$", name):
        return "kg2"
    if re.match(r"^basic\s*[1-3]$", name):
        return "lowerPrimary"
    if re.match(r"^basic\s*[4-6]$", name):
        return "upperPrimary"
    if re.match(r"^jhs\s*[1-3]$", name):
        return "juniorHigh"
    return "lowerPrimary"


def subjects_for_class(class_name):
    """The subjects that class actually teaches."""
    return list(CURRICULUM[curriculum_key(class_name)])


def assessment_for_class(class_name):
    """Pre-school and KG are observed continuously; Basic and JHS are examined."""
    if curriculum_key(class_name) in CONTINUOUS_ASSESSMENT_KEYS:
        return {"mode": "continuous", "scoreMax": 100, "exam": False}
    return {"mode": "exam", "scoreMax": 40, "exam": True}


# Starting results, identical to the browser portals (detlof-report.js) so a
# student sees the same thing whether the API or localStorage answers.
def grade_for(total):
    if total >= 80:
        return "A"
    if total >= 70:
        return "B"
    if total >= 60:
        return "C"
    if total >= 50:
        return "D"
    if total >= 40:
        return "E"
    return "F"


def default_results(class_name, seed=0):
    """A spread of scores across the subjects that class actually teaches."""
    patterns = [
        (34, 58, "Excellent progress"),
        (32, 56, "Very good"),
        (30, 55, "Keep it up"),
        (29, 52, "Good work"),
        (27, 50, "Good effort"),
        (25, 46, "A little more practice needed"),
        (30, 53, "Steady improvement"),
        (33, 57, "Strong work"),
        (28, 48, "Satisfactory"),
        (31, 54, "Well done"),
        (26, 49, "Can do better"),
        (29, 51, "Consistent effort"),
    ]
    results = []
    for index, subject in enumerate(subjects_for_class(class_name)):
        class_score, exam_score, remark = patterns[(seed + index) % len(patterns)]
        total = round(class_score + exam_score, 2)
        results.append({
            "subject": subject,
            "classScore": class_score,
            "examScore": exam_score,
            "totalScore": total,
            "grade": grade_for(total),
            "remark": remark,
        })
    return results


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
    for student_index, student in enumerate(students):
        record = dict(student)
        term_results = dict(record.get("termResults") or {})
        if not term_results.get("term1"):
            term_results["term1"] = {
                "results": default_results(record.get("currentClass"), student_index),
                "gpa": None,
                "subjectCount": 0,
            }
            term_results["term1"]["subjectCount"] = len(term_results["term1"]["results"])
        record["termResults"] = term_results
        seeded.append(record)
    return seeded


DEFAULT_STUDENTS = seed_default_results(ROSTER.get("students") or [])


def latest_results_for_class(class_name):
    """Published results for a class, taken from the stored student records."""
    if not class_name or class_name not in CLASS_ORDER:
        return jsonify({"error": "Unknown class."}), 400
    rows = [student for student in STUDENTS if student.get("currentClass") == class_name]
    published = []
    for student in rows:
        term_results = student.get("termResults") or {}
        for term_key in ("term1", "term2", "term3"):
            for result in (term_results.get(term_key) or {}).get("results", []):
                published.append({
                    "studentId": student.get("studentId"),
                    "fullName": student.get("fullName"),
                    "term": term_key,
                    **result,
                })
    return jsonify({
        "class": class_name,
        "academicYear": ACADEMIC_YEAR,
        "results": published,
        "subjects": subjects_for_class(class_name),
        "assessment": assessment_for_class(class_name),
    })

ANNOUNCEMENTS = [
    {"title": "Term 3 assessments begin next Monday", "category": "School Notice", "date": "May 14, 2026", "body": "Please check the assessment schedule and bring your required materials each day."},
    {"title": "Science has moved to the Science Lab", "category": "Timetable Update", "date": "May 9, 2026", "body": "Wednesday science lessons will take place in the Science Lab from 10:30 AM."},
    {"title": "Term 3 results are now available", "category": "Results Update", "date": "May 7, 2026", "body": "Your latest academic results have been published."},
]

# ---------------------------------------------------------------------------
# Public website content
#
# This is the one source for what the main website shows. It starts from the
# school's published details and is then managed by an administrator, so the
# public site never carries a second hard-coded copy.
# ---------------------------------------------------------------------------
DEFAULT_SITE_CONTENT = {
    "schoolName": "Detlof Preparatory School",
    "tagline": "Raising future leaders through excellence and discipline",
    "vision": "To provide a nurturing and inclusive learning environment.",
    "mission": "Detlof Seeks to empower its learners to become lifelong students, critical thinkers, and compassionate individuals who contribute to and make a difference in the world.",
    "about": "Detlof Preparatory School welcomes learners from Nursery through to JHS 2, with a heart for growth and curiosity.",
    "phone": "+233 24 421 9845",
    "email": "detlofprep@gmail.com",
    "address": "",
    "admissionNote": "Admission for students from Pre-school to JHS 2 ends on 5th January 2026.",
    "reopeningNote": "Beginning of first term for the 2025/26 academic year is 11th January 2026.",
    "subjects": [
        {"name": "Mathematics", "text": "We build strong problem-solving skills and numerical confidence."},
        {"name": "Science", "text": "Hands-on experiments and discoveries make science exciting!"},
        {"name": "English", "text": "We build reading, writing, and communication skills from early on."},
        {"name": "Social Studies", "text": "Understanding our world, people, and cultures with fun lessons."},
        {"name": "Creative Arts", "text": "We let creativity bloom with drawing, music, and drama activities."},
        {"name": "ICT", "text": "Early exposure to computers and digital tools for the future."},
    ],
    "notices": [
        {"id": "ntc-1", "title": "Admission for students from Pre-school to JHS 2 ends on 5th January 2026", "date": "Admissions"},
        {"id": "ntc-2", "title": "Beginning of first term for 2025/26 Academic year - 11th January 2026", "date": "Term Dates"},
        {"id": "ntc-3", "title": "Creative Arts Fair this Friday", "date": "Events"},
        {"id": "ntc-4", "title": "PTA Meeting - Next Monday, 9:00 AM", "date": "PTA"},
    ],
    "events": [
        {"id": "evt-1", "title": "Admission of New students - Ends 5th January 2026"},
        {"id": "evt-2", "title": "Reopening date - 11th January"},
        {"id": "evt-3", "title": "Teachers Appreciation Day - August 2nd"},
        {"id": "evt-4", "title": "Graduation Ceremony - August 30th"},
    ],
}

SITE_TEXT_LIMITS = {
    "schoolName": 120, "tagline": 200, "vision": 400, "mission": 800,
    "about": 1200, "phone": 60, "email": 160, "address": 240,
    "admissionNote": 300, "reopeningNote": 300,
}

PERSISTED_ADMIN_USERS = []
# A one-item holder, so it can be updated in place like the other stored lists.
PERSISTED_SITE_CONTENT = []
# True when the store on disk is the old bare student list.
LEGACY_STORE_SHAPE = False


def copy_default_site_content():
    return copy.deepcopy(DEFAULT_SITE_CONTENT)


def load_students():
    """Seed the full official roster, then overlay anything previously saved."""
    global ANNOUNCEMENTS, LEGACY_STORE_SHAPE
    LEGACY_STORE_SHAPE = False
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
                # An older build saved the register as a bare list, which has
                # nowhere to keep administrator accounts or announcements. Note it
                # so the store is migrated after the module loads.
                LEGACY_STORE_SHAPE = True
            elif isinstance(data, dict):
                records = data.get("students", [])
                if isinstance(records, list):
                    stored = [item for item in records if isinstance(item, dict)]
                users = data.get("adminUsers", [])
                if isinstance(users, list):
                    # Update the list in place. Rebinding it here would leave
                    # ADMIN_USERS pointing at the old empty list, so admin
                    # logins would fail after a restart and the next save would
                    # overwrite the stored accounts with an empty list.
                    PERSISTED_ADMIN_USERS[:] = [
                        user for user in users
                        if isinstance(user, dict)
                        and user.get("email")
                        and user.get("passwordHash")
                        and user.get("role") in ("admin", "teacher", "academic_admin")
                    ]
                saved_announcements = data.get("announcements")
                if isinstance(saved_announcements, list):
                    ANNOUNCEMENTS[:] = [
                        announcement for announcement in saved_announcements
                        if isinstance(announcement, dict)
                        and announcement.get("id")
                        and announcement.get("title")
                    ]
                saved_site = data.get("siteContent")
                if isinstance(saved_site, dict):
                    merged_site = copy_default_site_content()
                    merged_site.update({key: value for key, value in saved_site.items() if value not in (None, "")})
                    PERSISTED_SITE_CONTENT[:] = [merged_site]
            else:
                raise ValueError("Student data file must contain a list or store object.")
        except (OSError, json.JSONDecodeError, ValueError) as error:
            raise RuntimeError("Could not load the Detlof data store: " + str(error)) from error

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
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    temp_file = DATA_FILE + ".tmp"
    with open(temp_file, "w", encoding="utf-8") as handle:
        json.dump(
            {
                "students": STUDENTS,
                "adminUsers": ADMIN_USERS,
                "announcements": ANNOUNCEMENTS,
                "siteContent": site_content(),
            },
            handle,
            indent=2,
            ensure_ascii=False,
        )
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temp_file, DATA_FILE)


def site_content():
    """The single source of truth for the public website's content."""
    if PERSISTED_SITE_CONTENT:
        return PERSISTED_SITE_CONTENT[0]
    defaults = copy_default_site_content()
    PERSISTED_SITE_CONTENT.append(defaults)
    return defaults


ADMIN_USERS = PERSISTED_ADMIN_USERS


def find_admin(email):
    normalized_email = str(email or "").strip().lower()
    return next(
        (user for user in ADMIN_USERS if str(user.get("email", "")).lower() == normalized_email),
        None,
    )


def admin_identity():
    email = session.get("admin_email")
    user = find_admin(email)
    if not user:
        session.clear()
        return None
    return {"email": user["email"], "name": user.get("name", user["email"]), "role": user["role"]}


def require_admin_role(*roles):
    def decorate(handler):
        @wraps(handler)
        def wrapped(*args, **kwargs):
            identity = admin_identity()
            if not identity:
                return jsonify({"error": "Administrator sign-in is required."}), 401
            if roles and identity["role"] not in roles:
                return jsonify({"error": "You are not authorized to perform this action."}), 403
            origin = request.headers.get("Origin")
            if request.method not in ("GET", "HEAD", "OPTIONS") and origin:
                if origin.rstrip("/") != request.host_url.rstrip("/"):
                    return jsonify({"error": "Cross-origin administrative request rejected."}), 403
            return handler(*args, **kwargs)
        return wrapped
    return decorate


def save_admin_user(email, password, role, name):
    normalized_email = str(email or "").strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized_email):
        raise ValueError("Enter a valid administrator email address.")
    if len(password) < 12:
        raise ValueError("Administrator passwords must be at least 12 characters.")
    if len(password) > 256:
        raise ValueError("Administrator passwords cannot exceed 256 characters.")
    if role not in ("admin", "teacher", "academic_admin"):
        raise ValueError("Unsupported administrator role.")
    user = {
        "email": normalized_email,
        "name": str(name or normalized_email).strip(),
        "role": role,
        "passwordHash": generate_password_hash(password),
    }
    existing = find_admin(normalized_email)
    if existing:
        existing.update(user)
    else:
        ADMIN_USERS.append(user)
    save_students()
    return user



def extract_login_password(payload):
    if not isinstance(payload, dict):
        return ""
    for key in ("password", "loginCode", "pin"):
        value = payload.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


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


def migrate_legacy_store():
    """Rewrite an old bare student list as the full store.

    The earlier format kept only students, so administrator accounts and
    announcements had nowhere to live and any sign-in was refused. Moving to the
    full shape means accounts saved from now on survive. No student is lost: the
    list is carried over as-is.
    """
    if not LEGACY_STORE_SHAPE:
        return False
    save_students()
    print(
        "Store upgraded: detlof_data.json now keeps administrator accounts and "
        "announcements as well as students. Run 'python server.py setup-admin' "
        "to create the administrator sign-ins."
    )
    return True


migrate_legacy_store()


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
    return send_from_directory(".", "index.html")


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = request.form.to_dict()
    if not isinstance(data, dict):
        data = {}
    email = str(data.get("email", "")).strip().lower()
    student_id = str(data.get("studentId", "")).strip().upper()
    password = extract_login_password(data)

    student = find_student(email, student_id, password)
    if student:
        return jsonify({"student": student})
    return jsonify({"error": "Invalid email, student ID, or login code."}), 401


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Submit an email address and password."}), 400
    # No accounts at all is a setup problem, not a wrong password. Saying so saves
    # an administrator hunting for a typo that does not exist.
    if not ADMIN_USERS:
        return jsonify({
            "error": "No administrator account exists yet. Create one with: python server.py setup-admin",
            "code": "no_accounts",
        }), 503
    user = find_admin(data.get("email"))
    password = str(data.get("password") or "")
    if not user or not check_password_hash(user["passwordHash"], password):
        return jsonify({"error": "Invalid email or password."}), 401
    session.clear()
    session.permanent = True
    session["admin_email"] = user["email"]
    return jsonify({"user": {
        "email": user["email"],
        "name": user.get("name", user["email"]),
        "role": user["role"],
    }})


@app.route("/api/admin/session", methods=["GET"])
def admin_session():
    identity = admin_identity()
    if not identity:
        return jsonify({"authenticated": False})
    return jsonify({"authenticated": True, "user": identity})


@app.route("/api/admin/students", methods=["GET"])
@require_admin_role("admin", "teacher", "academic_admin")
def admin_students():
    return jsonify({"students": STUDENTS})


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/admin/password", methods=["POST"])
@require_admin_role("admin", "teacher", "academic_admin")
def change_admin_password():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Submit the current and new passwords."}), 400
    identity = admin_identity()
    user = find_admin(identity["email"])
    current_password = str(data.get("currentPassword") or "")
    if not check_password_hash(user["passwordHash"], current_password):
        return jsonify({"error": "Current password is incorrect."}), 401
    new_password = str(data.get("newPassword") or "")
    if len(new_password) < 12 or len(new_password) > 256:
        return jsonify({"error": "New password must be between 12 and 256 characters."}), 400
    user["passwordHash"] = generate_password_hash(new_password)
    save_students()
    return jsonify({"ok": True})


@app.route("/api/admin/bulk-import", methods=["POST"])
@require_admin_role("admin", "teacher", "academic_admin")
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
@require_admin_role("admin", "teacher", "academic_admin")
def student_update():
    data = request.get_json(silent=True) or {}
    student = data.get("student")
    if not isinstance(student, dict) or not student.get("studentId"):
        return jsonify({"error": "Invalid student payload."}), 400
    saved = merge_student(student)
    save_students()
    return jsonify({"student": saved})


@app.route("/api/site-content", methods=["GET"])
def public_site_content():
    """What the public website renders. Read-only, no authentication needed."""
    return jsonify(site_content())


def validate_site_content(payload):
    """Check an administrator's website edits before anything is stored."""
    if not isinstance(payload, dict):
        return None, "Submit the website content to save."
    updates = {}
    for field, limit in SITE_TEXT_LIMITS.items():
        if field not in payload:
            continue
        value = str(payload.get(field) or "").strip()
        if len(value) > limit:
            return None, field.replace("([A-Z])", r" \1").strip().title() + " is too long (max " + str(limit) + " characters)."
        updates[field] = value

    for list_field, item_keys in (("notices", ("title",)), ("events", ("title",))):
        if list_field not in payload:
            continue
        items = payload.get(list_field)
        if not isinstance(items, list):
            return None, "Notices and events must be lists."
        cleaned = []
        for item in items:
            if not isinstance(item, dict):
                continue
            entry = dict(item)
            for key in item_keys:
                entry[key] = str(entry.get(key) or "").strip()
                if not entry[key]:
                    break
                if len(entry[key]) > 240:
                    return None, "A notice or event title is too long."
            else:
                entry.setdefault("id", "item-" + secrets.token_urlsafe(8))
                cleaned.append(entry)
        if len(cleaned) > 60:
            return None, "Keep it to 60 notices or events."
        updates[list_field] = cleaned

    if "subjects" in payload:
        subjects = payload.get("subjects")
        if not isinstance(subjects, list):
            return None, "Subjects must be a list."
        cleaned = []
        for item in subjects:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            cleaned.append({
                "name": name[:80],
                "text": str(item.get("text") or "").strip()[:400],
            })
        if len(cleaned) > 30:
            return None, "Keep it to 30 subject entries."
        updates["subjects"] = cleaned

    if not updates:
        return None, "Nothing to save."
    return updates, None


@app.route("/api/admin/site-content", methods=["PUT"])
@require_admin_role("admin", "academic_admin")
def update_site_content():
    updates, error = validate_site_content(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400
    with STORE_LOCK:
        content = site_content()
        content.update(updates)
        content["updatedAt"] = datetime.now(timezone.utc).isoformat()
        content["updatedBy"] = admin_identity()["name"]
        save_students()
    return jsonify({"siteContent": content})


@app.route("/api/admin/site-content", methods=["POST"])
@require_admin_role("admin", "academic_admin")
def reset_site_content():
    """Put the published school details back, in one authorised step."""
    with STORE_LOCK:
        PERSISTED_SITE_CONTENT[:] = [copy_default_site_content()]
        save_students()
    return jsonify({"siteContent": site_content()})


@app.route("/api/results")
def results():
    """Results for one class, from the shared store. No second copy of the data."""
    return latest_results_for_class(request.args.get("class", ""))


@app.route("/api/roster")
def roster():
    """Expose the official roster so the browser portals can stay in sync."""
    public_roster = {
        key: value
        for key, value in ROSTER.items()
        if key != "students"
    }
    public_roster["students"] = [
        {key: value for key, value in student.items() if key != "loginCode"}
        for student in ROSTER.get("students", [])
    ]
    return jsonify(public_roster)


@app.route("/api/announcements")
def announcements():
    return jsonify(ANNOUNCEMENTS)


def validate_announcement(data):
    if not isinstance(data, dict):
        return None, "Submit an announcement object."
    title = str(data.get("title") or "").strip()
    message = str(data.get("message") or data.get("body") or "").strip()
    category = str(data.get("category") or "School Notice").strip()
    target_class = str(data.get("targetClass") or "").strip()
    categories = {"Results Update", "Timetable Update", "School Notice", "Individual Update"}
    if not title or len(title) > 160:
        return None, "Title is required and must be 160 characters or fewer."
    if not message or len(message) > 5000:
        return None, "Message is required and must be 5000 characters or fewer."
    if category not in categories:
        return None, "Select a valid announcement category."
    if target_class and target_class not in CLASS_ORDER:
        return None, "Select a valid school class."
    return {
        "title": title,
        "message": message,
        "category": category,
        "targetClass": target_class,
    }, None


@app.route("/api/admin/announcements", methods=["POST"])
@require_admin_role("admin", "teacher", "academic_admin")
def create_announcement():
    payload, error = validate_announcement(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400
    now = datetime.now(timezone.utc)
    announcement = {
        "id": "ann-" + secrets.token_urlsafe(12),
        **payload,
        "body": payload["message"],
        "date": now.strftime("%b %d, %Y"),
        "createdAt": now.isoformat(),
        "createdBy": admin_identity()["name"],
        "individual": False,
    }
    with STORE_LOCK:
        ANNOUNCEMENTS.insert(0, announcement)
        save_students()
    return jsonify({"announcement": announcement}), 201


@app.route("/api/admin/announcements/<announcement_id>", methods=["PUT"])
@require_admin_role("admin", "teacher", "academic_admin")
def update_announcement(announcement_id):
    payload, error = validate_announcement(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400
    with STORE_LOCK:
        announcement = next((item for item in ANNOUNCEMENTS if item["id"] == announcement_id), None)
        if not announcement:
            return jsonify({"error": "Announcement not found."}), 404
        announcement.update(payload)
        announcement["body"] = payload["message"]
        announcement["updatedAt"] = datetime.now(timezone.utc).isoformat()
        save_students()
    return jsonify({"announcement": announcement})


@app.route("/api/admin/announcements/<announcement_id>", methods=["DELETE"])
@require_admin_role("admin", "teacher", "academic_admin")
def delete_announcement(announcement_id):
    with STORE_LOCK:
        index = next((i for i, item in enumerate(ANNOUNCEMENTS) if item["id"] == announcement_id), None)
        if index is None:
            return jsonify({"error": "Announcement not found."}), 404
        removed = ANNOUNCEMENTS.pop(index)
        save_students()
    return jsonify({"announcement": removed})


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("setup-admin", "reset-admin-password"):
        command = sys.argv[1]
        if command == "setup-admin":
            role = sys.argv[2] if len(sys.argv) > 2 else "admin"
            default_email = {
                "admin": "admin@detlof.edu.gh",
                "teacher": "teacher@detlof.edu.gh",
                "academic_admin": "admin-academics@detlof.edu.gh",
            }.get(role)
            email = input("Administrator email [" + (default_email or "") + "]: ").strip() or default_email
            name = input("Display name: ").strip() or email
            password = getpass("New password (12+ characters): ")
            confirmation = getpass("Confirm password: ")
            if password != confirmation:
                raise SystemExit("Passwords do not match.")
            try:
                save_admin_user(email, password, role, name)
            except ValueError as error:
                raise SystemExit(str(error)) from error
            print("Administrator account saved. Password is stored as a hash.")
        else:
            email = (sys.argv[2] if len(sys.argv) > 2 else input("Administrator email: ")).strip().lower()
            user = find_admin(email)
            if not user:
                raise SystemExit("No administrator account exists for that email.")
            password = getpass("New password (12+ characters): ")
            confirmation = getpass("Confirm password: ")
            if password != confirmation:
                raise SystemExit("Passwords do not match.")
            if len(password) < 12 or len(password) > 256:
                raise SystemExit("Password must be between 12 and 256 characters.")
            user["passwordHash"] = generate_password_hash(password)
            save_students()
            print("Administrator password reset. Password is stored as a hash.")
    else:
        app.run(
            host=os.environ.get("DETLOF_HOST", "127.0.0.1"),
            port=int(os.environ.get("PORT", "5000")),
            debug=False,
        )
