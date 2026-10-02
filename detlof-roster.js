// Detlof Preparatory School — Official Student Roster (2025 / 2026)
// One class per year level: the register's boys and girls sections are merged
// into a single class, boys first then girls.
// Single source of truth shared by the admin portal, student portal and server.py.

const DETLOF_ACADEMIC_YEAR = "2025 / 2026";
const DETLOF_SCHOOL_DOMAIN = "detlof.edu.gh";

const DETLOF_CLASS_ORDER = [
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
  "JHS 3"
];

const DETLOF_CLASS_PREFIX = {
  "Creche": "PRE",
  "KG 1": "KG1",
  "KG 2": "KG2",
  "Basic 1": "B1",
  "Basic 2": "B2",
  "Basic 3": "B3",
  "Basic 4": "B4",
  "Basic 5": "B5",
  "Basic 6": "B6",
  "JHS 1": "J1",
  "JHS 2": "J2",
  "JHS 3": "J3"
};

const DETLOF_CLASS_ROSTER = {
  "Creche": [
    "FIIFI SOWYER",
    "NESSA JESUSLINE AFFUL",
    "KOFI MOSES",
    "OBREMPONG",
    "ENYIMYAM"
  ],
  "KG 1": [
    "KRISTEN DENNISON ESSOUN",
    "COMFORT EWONAM AKAKPOH",
    "MARCUS KOBBY PRAH",
    "DOXA EGYAPA KOBINA PRAH",
    "JOSEPH KUDANU",
    "JESSE ODOOM",
    "ELWY XOLARLI DZOBO",
    "NHYIRABA BRENU",
    "ROBERT ANTHONY ESSOUN",
    "ELORA AARYN AMOAH",
    "FIIFI GARBRAH",
    "RUEBEN AMISSAH",
    "WARRICK OSWALD EWUAH",
    "GIOVANA ANIM",
    "GABRIELLA AMISSAL",
    "ZIPPORAH AGYAPONG",
    "THIERY O. ANKRAH",
    "OHEMAA",
    "DUALA",
    "CALISTA OBENG APPIAH",
    "NAA AGELE",
    "KENDRICK",
    "JANET",
    "WISDOM",
    "ZULAIHA ALI"
  ],
  "KG 2": [
    "NAPOLEON ODEHYE ARKRAH",
    "KELVIN KWEGYIR ENTSUAH",
    "EDMUND FIIFI MENSAH",
    "ARCHIBALD NII A. QUAYSON",
    "EWARD ELOLO AGBETZI",
    "JUSTIN QUANSAH",
    "CYRIL T. ESSELIFIE",
    "AZZAM NSIYA ZILKIFILU",
    "BENEDICT BORLABI BORTEY",
    "GEOVANNA K. ARTHUR",
    "VARNIKA A. ESSEL",
    "DOMINION DADZIE",
    "GODJOY ASMAH",
    "GODPRAISE ASMAH",
    "MAYA BRITT APPIAH",
    "HENRITTA STAR ARTHUR",
    "PATRICIA DADZIE",
    "AMA ANOKYEWAA ADUSEI",
    "PERCIS WOODE AGYAPONG LAURIAN BANSO",
    "LEON KOJO AFFUL",
    "LEO BAIJON QUANSAH",
    "ZANA AKORFUL",
    "ANTHONY",
    "ARMSTRONG",
    "ZAID ADAMU",
    "PRECIOUS ESSIEN",
    "ELSIE ABAKAH MENSAH",
    "UZZIAH",
    "BLESSED",
    "MATTHEW ABAKAH",
    "DESTINY TAY",
    "FIRDAUS BAIDOO",
    "MARCEL ISIBU THOMPSON",
    "NHYIRA EDUSEI",
    "ELIANA MENSAH",
    "LARA MENSAH",
    "LAURIAN DANSO"
  ],
  "Basic 1": [
    "AGYAPONG JEHOSAPHAT",
    "AGYAPONG ADEI-KORSAH JAYDEN",
    "AGBETO JUSTICE",
    "AMOAH MYRON",
    "MANUKO JOSEPH KLENAM",
    "MAC-QUAYSON EMMANUEL",
    "MENSAH ABAKA D-C EPAPHRAS",
    "MENSAH LARTEY NII JOY EZEKIEL",
    "THOMRSON KSIBU GERALD",
    "AKUETTEH NAA DESOE URSULA",
    "ANYIDOH RICHLOVE",
    "ESSOUN ABA ADELAINE",
    "KUMEDU AKU SEDEM GWENDOLYN",
    "SAWYERR AKUA ELSIE"
  ],
  "Basic 2": [
    "ALI JANAL",
    "APPIAH GRIFFEON",
    "ARTHUR GOODSON REGINALD",
    "BORTEY DECENT SHADRACK",
    "CUDJOE HENRY ELKANAH",
    "DAKE SWANZY ARCHIBOLD",
    "DANSO CHERER",
    "MARFRED PALAS LAMPIEY",
    "MENSAH-SLIPPI PAPA LIBURIOUS",
    "ANDOH ONESIPHOROUS",
    "ODOOM KWAME JENSON",
    "BOATENG ADOAE JEFFERY",
    "AKYERE NANA ESI NELLY",
    "ANIM ABENA FLORA",
    "ANKAM ESSEL AMA KAY-ANN",
    "KOOMSON NHYIRABA QUEEN",
    "KUDANU EDINAM JULIET",
    "MENSAH BERINA",
    "MENSAH ASEDA KEZIAH",
    "MENSAH ABENA LORENA",
    "NAAMA COFFY",
    "TAY RUTH",
    "WOODE AMEYE ADWOA SELINA",
    "ANDOH DANUELLA"
  ],
  "Basic 3": [
    "ABAKAH DIVINE",
    "ABAKAH JABEN",
    "ACKROMOND GODWIN",
    "ACKROMOND MELVIN",
    "ADAMU JUWAHA-KORU ZUKLIFULU",
    "ADAMS ADEM PRINCE",
    "AKUFFO N. Y PHILBERT",
    "AUSTIN MENSAH KWEKU ROBERT",
    "BAIDOO A. RAHMAN",
    "BAMFO AMFO KWABENA",
    "BOHAM LEBRON RODNEY",
    "ESSEL TERRENCE",
    "MENSAH ATTA HERBERT",
    "MENSAH ATTA HUBERT",
    "NYANDOH ANTHONY",
    "TETIEH A. HUMPHREY",
    "WOODE AMEYE FIIFI DIVINE",
    "AMANZULEY N. JENNIFER",
    "ANSAH M-A. LOIS",
    "ANDERSON A. ROSEMOND",
    "BAESAW E. ANAVA",
    "DARZIE EUNICE",
    "EMMESAH CLEMENTINA",
    "ENNINFUL ERICA VALERIE",
    "LARTEY THEODOSIA",
    "QUANSAH CATHERINE",
    "SAWYER ESI CHRISTOLIGHT"
  ],
  "Basic 4": [
    "ABDUL AZIZ SAMAD",
    "ALI FAREED",
    "ARHIN TERENCE",
    "ASAMENE CEPHAS JACKLORD",
    "ESHUN LISIOWELL",
    "ESHUN JULIAN",
    "KOOMSON KELVIN",
    "MENSAH BANU FREDRICK",
    "QUAYSON DEGRAFT FYNN",
    "TETIEH ABI LORD",
    "YENZU KOJO NKUNTIM",
    "ACKROMOND ALEIHEA",
    "DANSO CHERYL",
    "ESHUN NHYIRABA",
    "KUDANU JESSICA",
    "MENSAH NANU LOVE",
    "QUIST DOSIC VALERIE",
    "ASMAH NHYIRA RICHLOVE"
  ],
  "Basic 5": [
    "BASSAW AARON",
    "COMP ESSIEN BENEDICT",
    "KUBANU CALVIN",
    "MENSAH DUKU KINGSFORD",
    "MENSAH ABAKAH EZRA",
    "MENSAH KOJO LEONARD",
    "NORTEY MENSAH GIDEON",
    "NUISU ALARIC ELIKEM",
    "TAYLOR KORANKYE NATHANIEL",
    "ENOCK ABDAE",
    "ANSAH KWENUA NHYIRA",
    "BLANKSON ANASTASIA",
    "CORBINAH MARY",
    "DOGBEY EMILY",
    "HARRISON ZITA SARAH",
    "MENSAH AUSTIN NAANA",
    "MENSAH SLIPPI IMMACULATE"
  ],
  "Basic 6": [
    "BAIDEN PAPA QUECI",
    "BAIDOO USMAN",
    "BRUSAH YAKUBU HENRY",
    "DANSO JERRY O-LARM",
    "ERHAN ISAIAH",
    "GYM EKOW MENSAH",
    "LAMPIEY BISMARK",
    "NYAMSON KWEKU SYLVESTER",
    "QUAYSON JONATHAN",
    "SALIFU-BRIDGE MICHEAL",
    "AKUFFO ADZEPA CLARITEL",
    "BOTSIO MICHEALINA",
    "BRACE-FLINTWOOD MICHELLE",
    "GANOR JEMIMA",
    "GYASI SARPOMAA MELLISA",
    "KOOMSON CHRISTODIA",
    "LARTEY VALERIE",
    "MENSAH ABENA MAAME",
    "MENSAH BIBIANA",
    "MEYES NYENZU EFUA NHYIRA",
    "QUAYSON GLORIA",
    "WOODE NICHOLINA"
  ],
  "JHS 1": [
    "AMOAH LORD MARCUS",
    "ARTHUR CEDERRAI",
    "BAFFOUR OHUSU ANDY",
    "CORBINAH DANIEL",
    "EDWIN PAPA SAMUEL",
    "MENSAH GODFREY",
    "NUISU ZANEIDE EUGENE",
    "QUIST AUSTROPP",
    "ACKAH CHRISTIANA",
    "ALI SONIA",
    "AMEGEDE EDWINA SELIKEM",
    "ARTHUR DANIELS ANGEL",
    "BOHAM NHYIRA LORRAINE",
    "COBBINAH BLESS",
    "DARZIE AMA DEBORAH",
    "DANSO AGNES",
    "DANSO ENURADWOA MILDRED",
    "DAVIES ARABA ANORIWE",
    "ENNONSON CHARLOTTE",
    "ESHUN PEIROLINA",
    "GBABRAH PAILINA",
    "MENSAH KONTIOH EKUA MAAME",
    "MENSAH JUSTINA",
    "MOHAMMED HIDAYA SALIFU",
    "QUARSHIE GABRIELLA",
    "SAAKAH DANIELLA",
    "THOMPSON MEVILYN"
  ],
  "JHS 2": [
    "ADU-ATEYI DANIEL",
    "BAIDOO THOMAS",
    "DANSO ROLAND",
    "ENNINFUL ERIC KELVIN",
    "MENSAH KOJO EBENEZER",
    "MENSAH JOSIAH",
    "NYANDOH PROSPER",
    "NYARKO ANTWI CYRUS",
    "OMOOME BOETUY KOFI ALBERT",
    "BAIDOO SHERRIFA",
    "DOE DELA JOANITA",
    "ESHUN ARENA LEWISA",
    "KOUSSANTIE AGNES ABA",
    "KWANSAH MAAME ESI",
    "MENSAH NORTEY JOSEPHINE",
    "NKERSIA MIRACLE",
    "QUARSHIE FAUSTINA",
    "TAYLOR KORANKYE EMMANUELLA",
    "THOMPSON ERNESTINA"
  ],
  "JHS 3": [
    "CUDJOE ERIC",
    "BOUFFAND MICHAEL ANGE",
    "CUDJOE ERICA",
    "ESHUN GEORGETTE",
    "GOLLEY E. PEDE",
    "KOLOEL RIHANNA",
    "ODOI FREDA",
    "QUAYSON AGNES",
    "THOMFORD ANNA"
  ]
};



function detlofNormalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toUpperCase();
}

function detlofRosterNamesForClass(className) {
  return (DETLOF_CLASS_ROSTER[className] || []).slice();
}

function detlofRosterEmailFor(name) {
  return String(name || "").trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\./, "")
    .replace(/\.$/, "") + "@" + DETLOF_SCHOOL_DOMAIN;
}

function detlofBuildRosterStudents() {
  const students = [];
  const usedEmails = new Map();
  let loginSequence = 1000;
  DETLOF_CLASS_ORDER.forEach((className) => {
    const names = DETLOF_CLASS_ROSTER[className] || [];
    const prefix = DETLOF_CLASS_PREFIX[className] || "DPS";
    names.forEach((fullName, index) => {
      let email = detlofRosterEmailFor(fullName);
      if (usedEmails.has(email)) {
        const seen = usedEmails.get(email) + 1;
        usedEmails.set(email, seen);
        email = email.replace("@" + DETLOF_SCHOOL_DOMAIN, seen + "@" + DETLOF_SCHOOL_DOMAIN);
      } else {
        usedEmails.set(email, 1);
      }
      loginSequence += 1;
      students.push({
        fullName: fullName,
        email: email,
        studentId: prefix + "-" + String(index + 1).padStart(4, "0"),
        currentClass: className,
        academicYear: DETLOF_ACADEMIC_YEAR,
        loginCode: "DET-" + String(loginSequence),
      });
    });
  });
  return students;
}

function detlofRosterClassForName(name) {
  const target = detlofNormalizeName(name);
  for (let i = 0; i < DETLOF_CLASS_ORDER.length; i += 1) {
    const names = DETLOF_CLASS_ROSTER[DETLOF_CLASS_ORDER[i]] || [];
    if (names.indexOf(target) !== -1) return DETLOF_CLASS_ORDER[i];
  }
  return "";
}

const DETLOF_PROMOTION_LADDER = [
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
  "JHS 3"
];

function detlofClassLevel(className) {
  const name = String(className || "").trim();
  if (typeof detlofNextClassFor === "function") {
    // The school module owns the progression so the ladder cannot drift.
    return detlofNextClassFor(name) === name && DETLOF_PROMOTION_LADDER.indexOf(name) === -1
      ? -1
      : DETLOF_PROMOTION_LADDER.indexOf(name);
  }
  return DETLOF_PROMOTION_LADDER.indexOf(name);
}

function detlofNextClass(className) {
  if (typeof detlofNextClassFor === "function") return detlofNextClassFor(className);
  const level = detlofClassLevel(className);
  if (level < 0 || level >= DETLOF_PROMOTION_LADDER.length - 1) return className;
  return DETLOF_PROMOTION_LADDER[level + 1];
}

function detlofPrefixForClass(className) {
  return DETLOF_CLASS_PREFIX[className] || "DPS";
}

// ---------------------------------------------------------------------------
// Moving between school structures
//
// Records saved in a browser are kept in localStorage, so changing the class
// list or the Student ID prefixes would otherwise leave the old classes showing
// up beside the new ones and duplicate every student under two IDs. This maps
// what was stored onto the current roster by student name, which is stable.
// ---------------------------------------------------------------------------
const DETLOF_DATA_VERSION = "pre-jhs3-2026";
const DETLOF_RETIRED_CLASSES = ["Basic 7", "Basic 8", "Basic 9", "Nursery One", "Nursery Two"];

function detlofCurrentRosterByName() {
  const map = new Map();
  detlofBuildRosterStudents().forEach((student) => {
    map.set(detlofNormalizeName(student.fullName), student);
  });
  return map;
}

function detlofMigrateStoredRecords(records) {
  const rosterByName = detlofCurrentRosterByName();
  const kept = [];

  (records || []).forEach((record) => {
    if (!record || !record.fullName) return;
    const key = detlofNormalizeName(record.rosterName || record.nameOverride || record.fullName);
    const student = rosterByName.get(key);

    if (student) {
      // The same student under the new Student ID. Anything the school entered is
      // kept. The class is only forced back to the roster's when the stored value
      // is one the school no longer runs, so an administrator's own class change
      // is never undone.
      const storedClass = String(record.currentClass || "");
      const classIsRetired = DETLOF_RETIRED_CLASSES.indexOf(storedClass) !== -1;
      const identityMoved = String(record.studentId).toUpperCase() !== student.studentId
        || (classIsRetired && storedClass !== student.currentClass);
      kept.push(Object.assign({}, record, {
        studentId: student.studentId,
        currentClass: classIsRetired ? student.currentClass : (storedClass || student.currentClass),
        email: record.email || student.email,
        academicYear: record.academicYear || student.academicYear,
        migratedFrom: identityMoved ? String(record.studentId) + " / " + record.currentClass : record.migratedFrom,
      }));
      return;
    }

// Not on the roster now. A genuine new admission is kept; only a leftover
    // from a class the school no longer runs is dropped, so it cannot resurface.
    if (DETLOF_RETIRED_CLASSES.indexOf(String(record.currentClass)) !== -1) return;
    kept.push(record);
  });

  // One record per student, newest wins.
  const byId = new Map();
  kept.forEach((record) => {
    const id = String(record.studentId).toUpperCase();
    if (!byId.has(id)) byId.set(id, record);
  });
  return Array.from(byId.values());
}
