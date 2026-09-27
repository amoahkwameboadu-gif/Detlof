// Detlof Preparatory School — Official Student Roster (2025 / 2026)
// Single source of truth shared by the admin portal, student portal and server.py.

const DETLOF_ACADEMIC_YEAR = "2025 / 2026";
const DETLOF_SCHOOL_DOMAIN = "detlof.edu.gh";

const DETLOF_CLASS_ORDER = [
  "Creche",
  "Nursery One",
  "Nursery Two",
  "KG 1",
  "KG 2 Boys",
  "KG 2 Girls",
  "Lower KG",
  "Upper KG",
  "Basic 1 Boys",
  "Basic 1 Girls",
  "Basic 2 Boys",
  "Basic 2 Girls",
  "Basic 3 Boys",
  "Basic 3 Girls",
  "Basic 4 Boys",
  "Basic 4 Girls",
  "Basic 5 Boys",
  "Basic 5 Girls",
  "Basic 6 Boys",
  "Basic 6 Girls",
  "Basic 7 Boys",
  "Basic 7 Girls",
  "Basic 8 Boys",
  "Basic 8 Girls",
  "Basic 9 Boys",
  "Basic 9 Girls",
  "JHS 1",
  "JHS 2",
  "JHS 3",
  "SHS 1",
  "SHS 2",
  "SHS 3"
];

const DETLOF_CLASS_PREFIX = {
  "Creche": "CRE",
  "Nursery One": "NUR1",
  "Nursery Two": "NUR2",
  "KG 1": "KG1",
  "KG 2 Boys": "KGB",
  "KG 2 Girls": "KGG",
  "Lower KG": "LKG",
  "Upper KG": "UKG",
  "Basic 1 Boys": "B1B",
  "Basic 1 Girls": "B1G",
  "Basic 2 Boys": "B2B",
  "Basic 2 Girls": "B2G",
  "Basic 3 Boys": "B3B",
  "Basic 3 Girls": "B3G",
  "Basic 4 Boys": "B4B",
  "Basic 4 Girls": "B4G",
  "Basic 5 Boys": "B5B",
  "Basic 5 Girls": "B5G",
  "Basic 6 Boys": "B6B",
  "Basic 6 Girls": "B6G",
  "Basic 7 Boys": "B7B",
  "Basic 7 Girls": "B7G",
  "Basic 8 Boys": "B8B",
  "Basic 8 Girls": "B8G",
  "Basic 9 Boys": "B9B",
  "Basic 9 Girls": "B9G",
  "JHS 1": "JHS1",
  "JHS 2": "JHS2",
  "JHS 3": "JHS3",
  "SHS 1": "SHS1",
  "SHS 2": "SHS2",
  "SHS 3": "SHS3"
};

const DETLOF_CLASS_ROSTER = {
  "Creche": [
    "FIIFI SOWYER",
    "NESSA JESUSLINE AFFUL",
    "KOFI MOSES",
    "OBREMPONG",
    "ENYIMYAM"
  ],
  "Nursery One": [
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
  "Nursery Two": [
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
    "ZIPPORAH AGYAPONG"
  ],
  "KG 2 Boys": [
    "NAPOLEON ODEHYE ARKRAH",
    "KELVIN KWEGYIR ENTSUAH",
    "EDMUND FIIFI MENSAH",
    "ARCHIBALD NII A. QUAYSON",
    "EWARD ELOLO AGBETZI",
    "JUSTIN QUANSAH",
    "CYRIL T. ESSELIFIE",
    "AZZAM NSIYA ZILKIFILU",
    "BENEDICT BORLABI BORTEY"
  ],
  "KG 2 Girls": [
    "GEOVANNA K. ARTHUR",
    "VARNIKA A. ESSEL",
    "DOMINION DADZIE",
    "GODJOY ASMAH",
    "GODPRAISE ASMAH",
    "MAYA BRITT APPIAH",
    "HENRITTA STAR ARTHUR",
    "PATRICIA DADZIE",
    "AMA ANOKYEWAA ADUSEI"
  ],
  "Lower KG": [],
  "Upper KG": [],
  "Basic 1 Boys": [
    "AGYAPONG JEHOSAPHAT",
    "AGYAPONG ADEI-KORSAH JAYDEN",
    "AGBETO JUSTICE",
    "AMOAH MYRON",
    "MANUKO JOSEPH KLENAM",
    "MAC-QUAYSON EMMANUEL",
    "MENSAH ABAKA D-C EPAPHRAS",
    "MENSAH LARTEY NII JOY EZEKIEL",
    "THOMRSON KSIBU GERALD"
  ],
  "Basic 1 Girls": [
    "AKUETTEH NAA DESOE URSULA",
    "ANYIDOH RICHLOVE",
    "ESSOUN ABA ADELAINE",
    "KUMEDU AKU SEDEM GWENDOLYN",
    "SAWYERR AKUA ELSIE"
  ],
  "Basic 2 Boys": [
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
    "BOATENG ADOAE JEFFERY"
  ],
  "Basic 2 Girls": [
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
  "Basic 3 Boys": [
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
    "WOODE AMEYE FIIFI DIVINE"
  ],
  "Basic 3 Girls": [
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
  "Basic 4 Boys": [
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
    "YENZU KOJO NKUNTIM"
  ],
  "Basic 4 Girls": [
    "ACKROMOND ALEIHEA",
    "DANSO CHERYL",
    "ESHUN NHYIRABA",
    "KUDANU JESSICA",
    "MENSAH NANU LOVE",
    "QUIST DOSIC VALERIE",
    "ASMAH NHYIRA RICHLOVE"
  ],
  "Basic 5 Boys": [
    "BASSAW AARON",
    "COMP ESSIEN BENEDICT",
    "KUBANU CALVIN",
    "MENSAH DUKU KINGSFORD",
    "MENSAH ABAKAH EZRA",
    "MENSAH KOJO LEONARD",
    "NORTEY MENSAH GIDEON",
    "NUISU ALARIC ELIKEM",
    "TAYLOR KORANKYE NATHANIEL",
    "ENOCK ABDAE"
  ],
  "Basic 5 Girls": [
    "ANSAH KWENUA NHYIRA",
    "BLANKSON ANASTASIA",
    "CORBINAH MARY",
    "DOGBEY EMILY",
    "HARRISON ZITA SARAH",
    "MENSAH AUSTIN NAANA",
    "MENSAH SLIPPI IMMACULATE"
  ],
  "Basic 6 Boys": [
    "BAIDEN PAPA QUECI",
    "BAIDOO USMAN",
    "BRUSAH YAKUBU HENRY",
    "DANSO JERRY O-LARM",
    "ERHAN ISAIAH",
    "GYM EKOW MENSAH",
    "LAMPIEY BISMARK",
    "NYAMSON KWEKU SYLVESTER",
    "QUAYSON JONATHAN",
    "SALIFU-BRIDGE MICHEAL"
  ],
  "Basic 6 Girls": [
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
  "Basic 7 Boys": [
    "AMOAH LORD MARCUS",
    "ARTHUR CEDERRAI",
    "BAFFOUR OHUSU ANDY",
    "CORBINAH DANIEL",
    "EDWIN PAPA SAMUEL",
    "MENSAH GODFREY",
    "NUISU ZANEIDE EUGENE",
    "QUIST AUSTROPP"
  ],
  "Basic 7 Girls": [
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
  "Basic 8 Boys": [
    "ADU-ATEYI DANIEL",
    "BAIDOO THOMAS",
    "DANSO ROLAND",
    "ENNINFUL ERIC KELVIN",
    "MENSAH KOJO EBENEZER",
    "MENSAH JOSIAH",
    "NYANDOH PROSPER",
    "NYARKO ANTWI CYRUS",
    "OMOOME BOETUY KOFI ALBERT"
  ],
  "Basic 8 Girls": [
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
  "Basic 9 Boys": [
    "CUDJOE ERIC",
    "BOUFFAND MICHAEL ANGE"
  ],
  "Basic 9 Girls": [
    "CUDJOE ERICA",
    "ESHUN GEORGETTE",
    "GOLLEY E. PEDE",
    "KOLOEL RIHANNA",
    "ODOI FREDA",
    "QUAYSON AGNES",
    "THOMFORD ANNA"
  ],
  "JHS 1": [],
  "JHS 2": [],
  "JHS 3": [],
  "SHS 1": [],
  "SHS 2": [],
  "SHS 3": []
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
  const usedCodes = new Set();
  let codeCounter = 1001;
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
      let loginCode = "";
      do { loginCode = "DET-" + String(codeCounter); codeCounter += 1; } while (usedCodes.has(loginCode));
      usedCodes.add(loginCode);
      students.push({
        fullName: fullName,
        email: email,
        studentId: prefix + "-" + String(index + 1).padStart(4, "0"),
        currentClass: className,
        academicYear: DETLOF_ACADEMIC_YEAR,
        loginCode: loginCode,
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
  "Creche", "Nursery One", "Nursery Two", "KG 1", "KG 2",
  "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6", "Basic 7", "Basic 8", "Basic 9",
  "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3",
];

function detlofClassLevel(className) {
  const basic = /^Basic (\d)/.exec(String(className || ""));
  if (basic) return 4 + Number(basic[1]);
  if (className === "KG 2 Boys" || className === "KG 2 Girls") return 4;
  return DETLOF_PROMOTION_LADDER.indexOf(className);
}

function detlofNextClass(className) {
  const level = detlofClassLevel(className);
  if (level < 0 || level >= DETLOF_PROMOTION_LADDER.length - 1) return className;
  const next = DETLOF_PROMOTION_LADDER[level + 1];
  const gender = / (Boys|Girls)$/.exec(String(className || ""));
  if (gender) {
    if (next === "KG 2") return "KG 2 " + gender[1];
    if (/^Basic \d$/.test(next)) return next + " " + gender[1];
  }
  return next;
}

function detlofPrefixForClass(className) {
  return DETLOF_CLASS_PREFIX[className] || "DPS";
}
