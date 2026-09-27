const STORAGE_KEY = "detlof_bulk_import_codes";
const IS_FILE_PROTOCOL = typeof window !== "undefined" && !!window.location && window.location.protocol === "file:";
// Served over http(s) the API lives on the same origin (server.py serves both the pages
// and /api/*), so a relative path is enough. Only a page opened straight from disk needs
// to reach out to the local Flask backend by absolute URL.
const PORTAL_API_BASE = IS_FILE_PROTOCOL ? "http://127.0.0.1:5000" : "";
let activeStudent = null;

const ACADEMIC_YEAR = "2025 / 2026";

const DEFAULT_RESULTS = [
  { subject: "Mathematics", classScore: 32, examScore: 56, totalScore: 88, grade: "B", remark: "Very good" },
  { subject: "English Language", classScore: 34, examScore: 60, totalScore: 94, grade: "A", remark: "Excellent progress" },
  { subject: "Integrated Science", classScore: 30, examScore: 55, totalScore: 85, grade: "B", remark: "Keep it up" },
  { subject: "Computing / ICT", classScore: 28, examScore: 50, totalScore: 78, grade: "C", remark: "Good work" },
  { subject: "Social Studies", classScore: 30, examScore: 52, totalScore: 82, grade: "B", remark: "Good effort" },
];

const DEFAULT_STUDENTS = [
  { fullName: "Kristen Denison Esoun", email: "kristen.esoun@detlof.edu.gh", studentId: "KG1-0001", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1001", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Comfort Ewonam Akakpoh", email: "comfort.akakpoh@detlof.edu.gh", studentId: "KG1-0002", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1002", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Marcus Kobby Prah", email: "marcus.prah@detlof.edu.gh", studentId: "KG1-0003", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1003", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Doxa Egyapa Kobina Prah", email: "doxa.prah@detlof.edu.gh", studentId: "KG1-0004", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1004", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Joseph Kudanu", email: "joseph.kudanu@detlof.edu.gh", studentId: "KG1-0005", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1005", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Jesse Odoop", email: "jesse.odom@detlof.edu.gh", studentId: "KG1-0006", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1006", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Elwy Xolarli Dzobo", email: "elwy.dzobo@detlof.edu.gh", studentId: "KG1-0007", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1007", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Nhyiraba Brena", email: "nhyiraba.brena@detlof.edu.gh", studentId: "KG1-0008", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1008", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Robert Anthony Esoun", email: "robert.esoun@detlof.edu.gh", studentId: "KG1-0009", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1009", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Elora Aaryn Amoah", email: "elora.amoah@detlof.edu.gh", studentId: "KG1-0010", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1010", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Fiifi Gabrab", email: "fiifi.gabrab@detlof.edu.gh", studentId: "KG1-0011", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1011", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Reuben Amosah", email: "reuben.amosah@detlof.edu.gh", studentId: "KG1-0012", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1012", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Warrick Oswald Ewua", email: "warrick.ewua@detlof.edu.gh", studentId: "KG1-0013", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1013", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Giovanna Anim", email: "giovanna.anim@detlof.edu.gh", studentId: "KG1-0014", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1014", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Gabriella Ammal", email: "gabriella.ammal@detlof.edu.gh", studentId: "KG1-0015", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1015", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Zipporah Agyapong", email: "zipporah.agyapong@detlof.edu.gh", studentId: "KG1-0016", currentClass: "KG 1", academicYear: ACADEMIC_YEAR, loginCode: "DET-1016", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term3: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  // KG 2 Boys
  { fullName: "Napoleon Odehy Arkhrah", email: "napoleon.arkhrah@detlof.edu.gh", studentId: "KGB-0001", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2001", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Kelvin Kwakyir Entsua", email: "kelvin.entsua@detlof.edu.gh", studentId: "KGB-0002", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2002", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Edmund Fiifi Mensah", email: "edmund.mensah@detlof.edu.gh", studentId: "KGB-0003", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2003", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Archibald Nii A. Quayson", email: "archibald.quayson@detlof.edu.gh", studentId: "KGB-0004", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2004", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Eward Eloelo Agbetzi", email: "eward.agbetzi@detlof.edu.gh", studentId: "KGB-0005", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2005", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Justin Quansah", email: "justin.quansah@detlof.edu.gh", studentId: "KGB-0006", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2006", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Cyril T. Esselifie", email: "cyril.esselifie@detlof.edu.gh", studentId: "KGB-0007", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2007", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Azzam Nsiya Zilkifilu", email: "azzam.zilkifilu@detlof.edu.gh", studentId: "KGB-0008", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2008", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Benedict Borlabi Bortey", email: "benedict.bortey@detlof.edu.gh", studentId: "KGB-0009", currentClass: "KG 2 Boys", academicYear: ACADEMIC_YEAR, loginCode: "DET-2009", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  // KG 2 Girls
  { fullName: "Geovanna K. Arthur", email: "geovanna.arthur@detlof.edu.gh", studentId: "KGG-0001", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2010", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Varnika A. Essel", email: "varnika.essel@detlof.edu.gh", studentId: "KGG-0002", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2011", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Dominion Dadzie", email: "dominion.dadzie@detlof.edu.gh", studentId: "KGG-0003", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2012", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Godjoy Asmah", email: "godjoy.asmah@detlof.edu.gh", studentId: "KGG-0004", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2013", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Godpraise Asmah", email: "godpraise.asmah@detlof.edu.gh", studentId: "KGG-0005", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2014", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Maya Britt Appiah", email: "maya.appiah@detlof.edu.gh", studentId: "KGG-0006", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2015", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Henritta Star Arthur", email: "henritta.arthur@detlof.edu.gh", studentId: "KGG-0007", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2016", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Patricia Dadzie", email: "patricia.dadzie@detlof.edu.gh", studentId: "KGG-0008", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2017", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Ama Anokyeewaa Adusei", email: "ama.adusei@detlof.edu.gh", studentId: "KGG-0009", currentClass: "KG 2 Girls", academicYear: ACADEMIC_YEAR, loginCode: "DET-2018", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) }, term2: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  // Nursery Two
  { fullName: "Percis Woode Agyapong Laorian Boso", email: "percis.boso@detlof.edu.gh", studentId: "NUR2-0001", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3001", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Leon Kojo Afful", email: "leon.afful@detlof.edu.gh", studentId: "NUR2-0002", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3002", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Leo Baijon Quansah", email: "leo.quansah@detlof.edu.gh", studentId: "NUR2-0003", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3003", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Zana Akorful", email: "zana.akorful@detlof.edu.gh", studentId: "NUR2-0004", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3004", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Anthony", email: "anthony@detlof.edu.gh", studentId: "NUR2-0005", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3005", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Armstrong", email: "armstrong@detlof.edu.gh", studentId: "NUR2-0006", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3006", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Zaid Adamu", email: "zaid.adamu@detlof.edu.gh", studentId: "NUR2-0007", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3007", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Precious Essien", email: "precious.essien@detlof.edu.gh", studentId: "NUR2-0008", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3008", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Elsie Abakah Mensah", email: "elsie.mensah@detlof.edu.gh", studentId: "NUR2-0009", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3009", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Uzziah", email: "uzziah@detlof.edu.gh", studentId: "NUR2-0010", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3010", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Blessed", email: "blessed@detlof.edu.gh", studentId: "NUR2-0011", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3011", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Matthew Abakah", email: "matthew.abakah@detlof.edu.gh", studentId: "NUR2-0012", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3012", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Destiny Tay", email: "destiny.tay@detlof.edu.gh", studentId: "NUR2-0013", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3013", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Firdaus Baidoo", email: "firdaus.baidoo@detlof.edu.gh", studentId: "NUR2-0014", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3014", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Marcel Isibu Thompson", email: "marcel.thompson@detlof.edu.gh", studentId: "NUR2-0015", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3015", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Nhyira Edusei", email: "nhyira.edusei@detlof.edu.gh", studentId: "NUR2-0016", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3016", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Eliana Mensah", email: "eliana.mensah@detlof.edu.gh", studentId: "NUR2-0017", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3017", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Lara Mensah", email: "lara.mensah@detlof.edu.gh", studentId: "NUR2-0018", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3018", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Laurian Danso", email: "laurian.danso@detlof.edu.gh", studentId: "NUR2-0019", currentClass: "Nursery Two", academicYear: ACADEMIC_YEAR, loginCode: "DET-3019", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  // Creche
  { fullName: "Fiifi Sowyer", email: "fiifi.sowyer@detlof.edu.gh", studentId: "CRE-0001", currentClass: "Creche", academicYear: ACADEMIC_YEAR, loginCode: "DET-4001", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Nessa Jesusline Afful", email: "nessa.afful@detlof.edu.gh", studentId: "CRE-0002", currentClass: "Creche", academicYear: ACADEMIC_YEAR, loginCode: "DET-4002", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Kofi Moses", email: "kofi.moses@detlof.edu.gh", studentId: "CRE-0003", currentClass: "Creche", academicYear: ACADEMIC_YEAR, loginCode: "DET-4003", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Obrenpong", email: "obrenpong@detlof.edu.gh", studentId: "CRE-0004", currentClass: "Creche", academicYear: ACADEMIC_YEAR, loginCode: "DET-4004", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Enyimyam", email: "enyiam@detlof.edu.gh", studentId: "CRE-0005", currentClass: "Creche", academicYear: ACADEMIC_YEAR, loginCode: "DET-4005", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  // Nursery One
  { fullName: "Thiery O. Ankrah", email: "thiery.anrah@detlof.edu.gh", studentId: "NUR1-0001", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5001", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Ohemaa", email: "ohemaa@detlof.edu.gh", studentId: "NUR1-0002", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5002", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Duo La", email: "duola@detlof.edu.gh", studentId: "NUR1-0003", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5003", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Calista Obeng Appiah", email: "calista.appiah@detlof.edu.gh", studentId: "NUR1-0004", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5004", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Naa Agele", email: "naa.agele@detlof.edu.gh", studentId: "NUR1-0005", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5005", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Kendrick", email: "kendrick@detlof.edu.gh", studentId: "NUR1-0006", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5006", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Janet", email: "janet@detlof.edu.gh", studentId: "NUR1-0007", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5007", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Wisdom", email: "wisdom@detlof.edu.gh", studentId: "NUR1-0008", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5008", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
  { fullName: "Zulaiha Ali", email: "zulaiha.ali@detlof.edu.gh", studentId: "NUR1-0009", currentClass: "Nursery One", academicYear: ACADEMIC_YEAR, loginCode: "DET-5009", termResults: { term1: { results: DEFAULT_RESULTS.map((r) => ({ ...r })) } } },
];

const DEFAULT_ANNOUNCEMENTS = [
  { title: "Term 3 assessments begin next Monday", category: "School Notice", date: "May 14, 2026", body: "Please check the assessment schedule and bring your required materials each day." },
  { title: "Science has moved to the Science Lab", category: "Timetable Update", date: "May 9, 2026", body: "Wednesday science lessons will take place in the Science Lab from 10:30 AM." },
  { title: "Term 3 results are now available", category: "Results Update", date: "May 7, 2026", body: "Your latest academic results have been published." },
];

const DAY_ORDER = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

// Inline SVG path data used for the promotion status icons (the markup ships SVG icons,
// so we swap the path instead of writing emoji text into an <svg> element).
const STATUS_ICON_PATHS = {
  promoted: "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z",
  on_try: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  repeated: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z",
  not_promoted: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z",
  pending: "M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z",
};

function byId(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const element = byId(id);
  if (element) element.textContent = text;
  return element;
}

function setAdjacentText(id, text) {
  const element = byId(id);
  const target = element ? element.nextElementSibling : null;
  if (target) target.textContent = text;
  return target;
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value == null ? "" : value;
  return element;
}

function setHtml(id, html) {
  const element = byId(id);
  if (element) element.innerHTML = html;
  return element;
}

function setStatusIcon(target, status) {
  if (!target) return;
  const svg = typeof target.tagName === "string" && target.tagName.toLowerCase() === "svg"
    ? target
    : target.querySelector("svg");
  if (!svg) return;
  const path = svg.querySelector("path");
  if (path) path.setAttribute("d", STATUS_ICON_PATHS[status] || STATUS_ICON_PATHS.promoted);
  svg.setAttribute("aria-label", String(status || "status").replace(/_/g, " "));
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeStudent(student) {
  if (!student || typeof student !== "object") return student;
  const normalized = { ...student };
  const parentPhone = normalized.parentPhone || normalized.profileParentPhone || "";
  const whatsappNumber = normalized.whatsappNumber || normalized.profileWhatsApp || "";
  normalized.parentPhone = parentPhone;
  normalized.profileParentPhone = parentPhone;
  normalized.whatsappNumber = whatsappNumber;
  normalized.profileWhatsApp = whatsappNumber;
  return normalized;
}

function mergeStudentData(existing, incoming) {
  const base = existing || {};
  const update = incoming || {};
  const merged = { ...base, ...update };
  const existingParentPhone = base.parentPhone || base.profileParentPhone || "";
  const existingWhatsApp = base.whatsappNumber || base.profileWhatsApp || "";
  const incomingParentPhone = update.parentPhone || update.profileParentPhone || "";
  const incomingWhatsApp = update.whatsappNumber || update.profileWhatsApp || "";
  if (incomingParentPhone) {
    merged.parentPhone = incomingParentPhone;
    merged.profileParentPhone = incomingParentPhone;
  } else if (existingParentPhone) {
    merged.parentPhone = existingParentPhone;
    merged.profileParentPhone = existingParentPhone;
  }
  if (incomingWhatsApp) {
    merged.whatsappNumber = incomingWhatsApp;
    merged.profileWhatsApp = incomingWhatsApp;
  } else if (existingWhatsApp) {
    merged.whatsappNumber = existingWhatsApp;
    merged.profileWhatsApp = existingWhatsApp;
  }
  return normalizeStudent(merged);
}

async function fetchPortalApi(path, options = {}) {
  // Same-origin first (works when server.py serves the page); the absolute local backend
  // URL is only tried for pages opened from disk.
  const urls = PORTAL_API_BASE ? [PORTAL_API_BASE + path, path] : [path];
  let lastResponse = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status === 401) return response;
      lastResponse = response;
    } catch {
      // Backend unreachable (static hosting / offline): fall through to the local records.
    }
  }
  return lastResponse;
}

function findSyncedStudent(credentials) {
  const source = credentials || {};
  const email = String(source.email || "").trim().toLowerCase();
  const studentId = String(source.studentId || "").trim().toUpperCase();
  const loginCode = String(source.loginCode || source.password || "").trim();
  return getSyncedStudents().find((student) =>
    String(student.email || "").trim().toLowerCase() === email &&
    String(student.studentId || "").trim().toUpperCase() === studentId &&
    String(student.loginCode || "").trim() === loginCode
  );
}

function upsertSyncedStudent(student) {
  const normalized = normalizeStudent(student);
  const students = getSyncedStudents();
  const index = students.findIndex((item) =>
    String(item.studentId || "").trim().toUpperCase() === String(normalized.studentId || "").trim().toUpperCase()
  );
  if (index >= 0) {
    students[index] = mergeStudentData(students[index], normalized);
  } else {
    students.unshift(normalized);
  }
  saveSyncedStudents();
  return students[index >= 0 ? index : 0];
}

async function resolveStudentFromCredentials(credentials, allowLocal = true) {
  const payload = {
    email: String(credentials.email || "").trim().toLowerCase(),
    studentId: String(credentials.studentId || "").trim().toUpperCase(),
    password: String(credentials.loginCode || credentials.password || "").trim(),
  };
  const response = await fetchPortalApi("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response) {
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.student) return normalizeStudent(data.student);
    }
    if (response.status === 401) return null;
  }
  if (!allowLocal) return null;
  const localStudent = findSyncedStudent(payload);
  return localStudent ? normalizeStudent(localStudent) : null;
}

function studentFromUrlParams(params) {
  // Only pick up the values actually present in the URL: a blanket default here would
  // overwrite the real record (class, year, …) when it is merged in.
  const raw = {
    fullName: params.get("fullName"),
    email: params.get("email"),
    studentId: params.get("studentId"),
    loginCode: params.get("code"),
    currentClass: params.get("class"),
    academicYear: params.get("year"),
    parentPhone: params.get("parentPhone") || params.get("profileParentPhone"),
    whatsappNumber: params.get("whatsappNumber") || params.get("profileWhatsApp"),
  };
  const fromUrl = {};
  Object.keys(raw).forEach((key) => {
    const value = raw[key];
    if (value != null && String(value).trim() !== "") fromUrl[key] = String(value).trim();
  });
  return normalizeStudent(fromUrl);
}

async function resolveStudentFromUrlParams(params) {
  const credentials = {
    email: params.get("email"),
    studentId: params.get("studentId"),
    loginCode: params.get("code"),
  };
  const remoteStudent = await resolveStudentFromCredentials(credentials, false);
  if (remoteStudent) return remoteStudent;
  const fromUrl = studentFromUrlParams(params);
  const localStudent = findSyncedStudent(credentials);
  if (localStudent) return mergeStudentData(localStudent, fromUrl);
  return normalizeStudent({
    fullName: "Detlof Student",
    currentClass: "KG 1",
    academicYear: ACADEMIC_YEAR,
    ...fromUrl,
  });
}

function getSyncedStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const map = new Map();
    DEFAULT_STUDENTS.forEach((student) => map.set(student.studentId.toUpperCase(), normalizeStudent(student)));
    if (Array.isArray(parsed)) {
      parsed.forEach((student) => {
        if (student && student.studentId) {
          const key = String(student.studentId).toUpperCase();
          const existing = map.get(key);
          map.set(key, normalizeStudent(existing ? mergeStudentData(existing, student) : student));
        }
      });
    }
    return Array.from(map.values());
  } catch {
    return DEFAULT_STUDENTS.map((student) => normalizeStudent(student));
  }
}

function saveSyncedStudents() {
  const synced = getSyncedStudents().map((student) => normalizeStudent(student));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
}

function showForgotNote() {
  const box = byId("loginInfoBox");
  if (!box) return;
  box.textContent = "Forgot your code? Ask the school office for your Login Code / PIN.";
  box.classList.remove("hidden");
}

function togglePasswordVisibility() {
  const passwordInput = byId("loginPassword");
  const toggleButton = byId("togglePasswordBtn");
  if (!passwordInput) return;
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  if (toggleButton) {
    toggleButton.textContent = isHidden ? "Hide" : "Show";
    toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  }
}

function fillCredentials(student) {
  if (!student) return;
  const credentials = normalizeStudent(student) || {};
  setValue("loginEmail", credentials.email || "");
  setValue("loginStudentId", credentials.studentId || "");
  const passwordInput = byId("loginPassword");
  if (passwordInput) {
    passwordInput.value = credentials.loginCode || "";
    passwordInput.type = "password";
  }
  const toggleButton = byId("togglePasswordBtn");
  if (toggleButton) {
    toggleButton.textContent = "Show";
    toggleButton.setAttribute("aria-label", "Show password");
  }
  const info = byId("loginInfoBox");
  if (info) {
    info.textContent = "Loaded credentials for " + (student.fullName || "this student") + " (" + (student.studentId || "—") + "). Click Sign in to Portal.";
    info.classList.remove("hidden");
  }
  const errorBox = byId("loginErrorBox");
  if (errorBox) errorBox.classList.add("hidden");
}

function sortedSchedule(schedule) {
  return [...schedule].sort((a, b) => {
    const dayDifference = (DAY_ORDER[a.day] || 99) - (DAY_ORDER[b.day] || 99);
    return dayDifference || String(a.time).localeCompare(String(b.time), undefined, { numeric: true });
  });
}

function resultRow(result, showRemark) {
  const classScore = Number(result.classScore || 0);
  const examScore = Number(result.examScore || 0);
  const total = Math.round((classScore + examScore) * 100) / 100;
  const grade = result.grade || calculateGrade(total);
  const remarkCell = showRemark
    ? "<td>" + escapeHtml(result.remark || "—") + (result.updatedBy ? "<br><small class='update-meta'>Updated by " + escapeHtml(result.updatedBy) + "</small>" : "") + "</td>"
    : "";
  return "<tr><td><strong>" + escapeHtml(result.subject) + "</strong></td><td>" + escapeHtml(classScore) + "</td><td>" + escapeHtml(examScore) + "</td><td><strong>" + escapeHtml(total) + "</strong></td><td><span class='grade-pill'>" + escapeHtml(grade) + "</span></td>" + remarkCell + "</tr>";
}

function calculateGrade(score) {
  const s = Number(score) || 0;
  if (s >= 80) return "A";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  if (s >= 50) return "D";
  if (s >= 40) return "E";
  return "F";
}

function gradeLabel(grade) {
  const labels = { A: "Excellent", B: "Very Good", C: "Good", D: "Pass", E: "Pass/Needs Improvement", F: "Fail" };
  return labels[grade] || grade;
}

function gradeToPoints(grade) {
  const points = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.5, F: 0.0 };
  return points[grade] ?? 0;
}

function calculateTermGPA(results) {
  if (!results || !results.length) return null;
  const totalPoints = results.reduce((sum, result) => {
    const total = Number(result.totalScore) || (Number(result.classScore || 0) + Number(result.examScore || 0));
    return sum + gradeToPoints(result.grade || calculateGrade(total));
  }, 0);
  return Math.round((totalPoints / results.length) * 100) / 100;
}

function calculateTermAverage(results) {
  if (!results || !results.length) return null;
  const sum = results.reduce((total, result) => total + (Number(result.totalScore) || (Number(result.classScore || 0) + Number(result.examScore || 0))), 0);
  return Math.round((sum / results.length) * 100) / 100;
}

function annualSubjectAverage(student, subject) {
  const allTerms = getAllTermResults(student);
  const termKeys = Object.keys(allTerms).filter((k) => allTerms[k]);
  if (termKeys.length < 3) return null;
  const scores = termKeys.map((k) => {
    const r = (allTerms[k].results || []).find((item) => item.subject === subject);
    return r ? Number(r.totalScore) || (Number(r.classScore || 0) + Number(r.examScore || 0)) : 0;
  });
  if (scores.length < 3) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / 3) * 100) / 100;
}

function calculateAnnualAverage(student) {
  const allTerms = getAllTermResults(student);
  const termKeys = Object.keys(allTerms).filter((k) => allTerms[k]);
  if (termKeys.length < 3) return null;
  const subjects = new Set();
  termKeys.forEach((k) => {
    if (Array.isArray(allTerms[k].results)) {
      allTerms[k].results.forEach((r) => subjects.add(r.subject));
    }
  });
  const scores = [];
  subjects.forEach((subject) => {
    const avg = annualSubjectAverage(student, subject);
    if (avg != null) scores.push(avg);
  });
  if (!scores.length || scores.length < subjects.size) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}

const CLASS_PROGRESSION = [
  "Creche", "Nursery One", "Nursery Two",
  "KG 1", "KG 2 Boys", "KG 2 Girls",
  "Lower KG", "Upper KG",
  "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6",
  "JHS 1", "JHS 2", "JHS 3",
  "SHS 1", "SHS 2", "SHS 3",
];

// Promotions that the plain list order cannot express: KG 2 is split into Boys/Girls,
// so a KG 1 pupil moves up to the "KG 2" year group, and both KG 2 streams move on to
// Basic 1 rather than into each other.
const NEXT_CLASS_OVERRIDES = { "KG 1": "KG 2", "KG 2 Boys": "Basic 1", "KG 2 Girls": "Basic 1" };

function nextClass(currentClass) {
  const name = String(currentClass || "").trim();
  if (NEXT_CLASS_OVERRIDES[name]) return NEXT_CLASS_OVERRIDES[name];
  const idx = CLASS_PROGRESSION.indexOf(name);
  return idx >= 0 && idx < CLASS_PROGRESSION.length - 1 ? CLASS_PROGRESSION[idx + 1] : name;
}

function getTermResults(student, term) {
  if (!student.termResults || !student.termResults[term]) return null;
  return student.termResults[term];
}

function getAllTermResults(student) {
  const terms = student.termResults || {};
  return {
    term1: terms.term1 || null,
    term2: terms.term2 || null,
    term3: terms.term3 || null,
  };
}

function calculateCumulativeGPA(student) {
  return calculateAnnualAverage(student);
}

function getAllGradesForStudent(student) {
  const allTerms = getAllTermResults(student);
  const grades = [];
  const scores = [];
  Object.values(allTerms).forEach((termData) => {
    if (termData && Array.isArray(termData.results)) {
      termData.results.forEach((result) => {
        grades.push(result.grade || calculateGrade(result.totalScore));
        scores.push(Number(result.totalScore || 0));
      });
    }
  });
  if (!grades.length) {
    const studentResults = Array.isArray(student.results) ? student.results : DEFAULT_RESULTS;
    studentResults.forEach((result) => {
      grades.push(result.grade || calculateGrade(result.totalScore));
      scores.push(Number(result.totalScore || 0));
    });
  }
  return { grades, scores };
}

function calculatePromotionStatus(student) {
  const allTerms = getAllTermResults(student);
  const termKeys = Object.keys(allTerms).filter((k) => allTerms[k]);
  if (termKeys.length < 3) return null;

  const annualAverage = calculateAnnualAverage(student);
  if (annualAverage == null) {
    return "pending";
  }

  if (annualAverage >= 50) {
    return "promoted";
  }
  return "not_promoted";
}

function getPromotionNoticeData(promotionStatus, annualAverage, student) {
  const nextCls = student.promotedClass || nextClass(student.currentClass || "KG 1");
  const avg = annualAverage != null ? annualAverage + "%" : "—";
  const notices = {
    promoted: {
      category: "Academic Year End Result",
      title: "Promoted to " + nextCls,
      message: "Congratulations! You have been successfully promoted to " + nextCls + ". Your annual average is " + avg + ". Keep up the excellent performance!",
      borderColor: "var(--crest-green)",
      bgColor: "var(--crest-green-soft)",
    },
    on_try: {
      category: "Conditional Promotion",
      title: "Promoted to " + nextCls + " (On Trial)",
      message: "You have been promoted to " + nextCls + " on trial. Your annual average is " + avg + ". Focus on improving your grades next year.",
      borderColor: "var(--crest-gold)",
      bgColor: "var(--crest-gold-soft)",
    },
    not_promoted: {
      category: "Academic Decision",
      title: "Not Promoted from " + (student.currentClass || "KG 1"),
      message: "Based on your annual average of " + avg + ", you are required to repeat " + (student.currentClass || "KG 1") + " next year. Speak to your class teacher for a recovery plan.",
      borderColor: "var(--crest-red)",
      bgColor: "var(--crest-red-soft)",
    },
    pending: {
      category: "In Progress",
      title: "Results Pending",
      message: "Your annual result is still being calculated. All three terms must be published before your final result is available.",
      borderColor: "var(--crest-gold)",
      bgColor: "var(--crest-gold-soft)",
    },
    repeated: {
      category: "Academic Decision",
      title: "Required to Repeat " + (student.currentClass || "KG 1"),
      message: "Based on your academic performance, you are required to repeat " + (student.currentClass || "KG 1") + " next year. Speak to your class teacher for a recovery plan.",
      borderColor: "var(--crest-red)",
      bgColor: "var(--crest-red-soft)",
    },
  };
  return notices[promotionStatus] || notices.pending;
}

function emptyRow(columns, message) {
  return "<tr><td colspan='" + columns + "' style='text-align:center;color:var(--muted);padding:20px;'>" + escapeHtml(message) + "</td></tr>";
}

function configureStudentProfileAccess() {
  ["profileParentName", "profileParentPhone", "profileWhatsApp", "profileHomeAddress"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.readOnly = true;
  });
  const picInput = document.getElementById("profilePicInput");
  const picBtn = document.getElementById("changePicBtn");
  if (picInput) picInput.style.display = "none";
  if (picBtn) picBtn.style.display = "none";
}

function renderPortalForStudent(student) {
  activeStudent = mergeStudentData(activeStudent, student);
  student = activeStudent || {};
  configureStudentProfileAccess();

  const loginScreen = byId("loginScreen");
  const portalShell = byId("portalShell");
  if (loginScreen) loginScreen.classList.add("hidden");
  if (portalShell) portalShell.classList.remove("hidden");

  const fullName = student.fullName || "Detlof Student";
  const currentClass = student.currentClass || "KG 1";
  const firstName = String(fullName).split(" ")[0] || "Student";

  setText("topbarStudentName", fullName);
  setText("topbarStudentMeta", currentClass + " · " + (student.studentId || "—") + " · " + (student.email || "—"));
  setText("dashWelcomeHeading", "Good morning, " + firstName + "!");
  setText("statClass", currentClass);
  setText("statStudentId", "Student ID: " + (student.studentId || "—"));

  const allTerms = getAllTermResults(student);
  const termCount = Object.values(allTerms).filter((t) => t != null).length;
  const annualAverage = calculateCumulativeGPA(student);
  setText(
    "dashTermInfo",
    termCount >= 3 ? "Third Term · Results Released" : termCount > 0 ? "Term " + termCount : "No Results Yet"
  );

  // Declared once — it used to be re-assigned further down, which threw
  // "Assignment to constant variable" and aborted the whole render.
  const promotionStatus = student.promotionStatus || calculatePromotionStatus(student);
  const showPromotion = termCount >= 3 && annualAverage != null && !!promotionStatus;

  const promoChip = byId("dashPromoChip");
  if (promoChip) {
    if (showPromotion) {
      const statuses = {
        promoted: { text: "Promoted to " + (student.promotedClass || nextClass(currentClass)), color: "var(--crest-green)", bg: "var(--crest-green-soft)" },
        on_try: { text: "On Trial — Promoted", color: "var(--crest-gold)", bg: "var(--crest-gold-soft)" },
        repeated: { text: "Repeating " + currentClass, color: "var(--crest-red)", bg: "var(--crest-red-soft)" },
        not_promoted: { text: "Repeating " + currentClass, color: "var(--crest-red)", bg: "var(--crest-red-soft)" },
      };
      const chipState = statuses[promotionStatus] || statuses.on_try;
      setStatusIcon(byId("dashPromoIcon"), promotionStatus);
      setText("dashPromoText", chipState.text + " · GPA " + annualAverage);
      promoChip.style.color = chipState.color;
      promoChip.style.background = chipState.bg;
      promoChip.classList.remove("hidden");
    } else {
      promoChip.classList.add("hidden");
    }
  }

  const hasResults = Array.isArray(student.results);
  const studentResults = hasResults ? student.results : DEFAULT_RESULTS;
  const average = studentResults.length
    ? Math.round(studentResults.reduce((total, result) => total + Number(result.totalScore || 0), 0) / studentResults.length)
    : null;
  const reportedAverage = annualAverage != null ? annualAverage : average;
  setText("statAverage", average == null ? "—" : average + "%");
  setAdjacentText(
    "statAverage",
    average == null
      ? (termCount ? termCount + " Term(s) Published" : "No results published yet")
      : (termCount ? "Annual Average: " + reportedAverage + "% · " + termCount + " Term(s)" : "Term 2 · " + studentResults.length + " Subjects Published")
  );

  const displayedTerm = student.displayedTerm || "all";
  setText(
    "resultsSubtitle",
    fullName + " (" + (student.studentId || "—") + ") · " + currentClass + " · Academic Year " + (student.academicYear || ACADEMIC_YEAR) +
      (displayedTerm !== "all" ? " · " + displayedTerm.replace("term", "Term ") : "")
  );
  setText("timetableSubtitle", "Current Class Timetable for " + currentClass + " · " + ACADEMIC_YEAR);

  let resultsToDisplay = [];
  if (displayedTerm !== "all" && allTerms[displayedTerm] && Array.isArray(allTerms[displayedTerm].results)) {
    resultsToDisplay = allTerms[displayedTerm].results;
  } else if (hasResults && studentResults.length) {
    resultsToDisplay = studentResults;
  } else if (termCount > 0) {
    Object.values(allTerms).forEach((termData) => {
      if (termData && Array.isArray(termData.results)) {
        termData.results.forEach((r) => resultsToDisplay.push(r));
      }
    });
  }

  const rowsToRender = resultsToDisplay.length ? resultsToDisplay : studentResults;
  let dashRows = "";
  let fullRows = "";
  if (rowsToRender.length) {
    rowsToRender.forEach((result) => {
      dashRows += resultRow(result, false);
      fullRows += resultRow(result, true);
    });
  } else {
    dashRows = emptyRow(5, "No results have been published for this student yet.");
    fullRows = emptyRow(6, "No results have been published for this student yet.");
  }
  setHtml("dashResultsBody", dashRows);
  setHtml("fullResultsBody", fullRows);

  const promoNotice = byId("promotionNotice");
  const promoNoticeInner = byId("promotionNoticeInner");
  const promoBadge = byId("resultsPromoBadge");
  if (showPromotion) {
    if (promoBadge) promoBadge.classList.remove("hidden");
    setStatusIcon(promoNoticeInner ? promoNoticeInner.querySelector(".promo-icon") : null, promotionStatus);
    const noticeData = getPromotionNoticeData(promotionStatus, annualAverage, student);
    setText("promotionNoticeCategory", noticeData.category);
    setText("promotionNoticeTitle", noticeData.title);
    setText("promotionNoticeMessage", noticeData.message);
    setText("promotionNoticeGPA", "GPA " + annualAverage);
    if (promoNotice) {
      promoNotice.style.borderLeft = "6px solid " + noticeData.borderColor;
      promoNotice.style.background = noticeData.bgColor;
      promoNotice.classList.remove("hidden");
    }
  } else {
    if (promoNotice) promoNotice.classList.add("hidden");
    if (promoBadge) promoBadge.classList.add("hidden");
  }

  let cumulativeRows = "";
  if (termCount > 0 || annualAverage != null) {
    const termLabels = { term1: "Term 1", term2: "Term 2", term3: "Term 3" };
    Object.keys(termLabels).forEach((termKey) => {
      const termData = allTerms[termKey];
      if (termData && Array.isArray(termData.results)) {
        const termAvg = termData.results.length
          ? Math.round(termData.results.reduce((s, r) => s + Number(r.totalScore || 0), 0) / termData.results.length)
          : null;
        const gradeDist = {};
        termData.results.forEach((r) => {
          const g = r.grade || calculateGrade(r.totalScore);
          gradeDist[g] = (gradeDist[g] || 0) + 1;
        });
        const distStr = Object.keys(gradeDist).sort().map((g) => g + "×" + gradeDist[g]).join(", ");
        const termGPA = termData.gpa != null ? termData.gpa : (termData.results.length ? calculateTermGPA(termData.results) : null);
        cumulativeRows +=
          "<tr><td>" + termLabels[termKey] + "</td><td>" + termData.results.length + "</td><td>" + (termAvg != null ? termAvg + "%" : "—") + "</td><td>" + (termGPA != null ? termGPA : "—") + "</td><td>" + (distStr || "—") + "</td></tr>";
      }
    });
    const { grades: totalGrades, scores: totalScores } = getAllGradesForStudent(student);
    const totalDist = {};
    totalGrades.forEach((g) => { totalDist[g] = (totalDist[g] || 0) + 1; });
    const totalDistStr = Object.keys(totalDist).sort().map((g) => g + "×" + totalDist[g]).join(", ");
    const cumulativeAvg = totalGrades.length ? Math.round(totalScores.reduce((s, sc) => s + sc, 0) / totalScores.length) : null;
    cumulativeRows +=
      "<tr style='border-top:2px solid var(--line);'><td><strong>Cumulative</strong></td><td>" + totalGrades.length + "</td><td><strong>" + (cumulativeAvg != null ? cumulativeAvg + "%" : "—") + "</strong></td><td><strong>" + (annualAverage != null ? annualAverage : "—") + "</strong></td><td><strong>" + (totalDistStr || "—") + "</strong></td></tr>";
  } else {
    cumulativeRows = emptyRow(5, "No term results have been published yet.");
  }
  setHtml("cumulativeSummaryBody", cumulativeRows);

  const defaultSchedule = [
    { day: "Monday", time: "8:00 – 9:00", subject: "Mathematics", teacher: "Mrs. Addo", venue: currentClass + " Room" },
    { day: "Monday", time: "9:00 – 10:00", subject: "English Language", teacher: "Mr. Mensah", venue: currentClass + " Room" },
    { day: "Tuesday", time: "8:00 – 9:00", subject: "Integrated Science", teacher: "Mrs. Owusu", venue: currentClass + " Room" },
    { day: "Wednesday", time: "10:30 – 11:30", subject: "Computing / ICT", teacher: "Mr. Kofi", venue: "ICT Lab" },
    { day: "Thursday", time: "11:30 – 12:30", subject: "Social Studies", teacher: "Ms. Aidoo", venue: currentClass + " Room" },
  ];
  const schedule = Array.isArray(student.timetable) ? sortedSchedule(student.timetable) : defaultSchedule;
  let dashTimetableRows = "";
  let fullTimetableRows = "";
  if (schedule.length) {
    schedule.forEach((item) => {
      dashTimetableRows += "<tr><td>" + escapeHtml(item.time) + "</td><td><strong>" + escapeHtml(item.subject) + "</strong></td><td>" + escapeHtml(item.venue || "—") + "</td></tr>";
      fullTimetableRows += "<tr><td>" + escapeHtml(item.day) + "</td><td>" + escapeHtml(item.time) + "</td><td><strong>" + escapeHtml(item.subject) + "</strong></td><td>" + escapeHtml(item.teacher || "Not assigned") + (item.updatedBy ? "<br><small class='update-meta'>Updated by " + escapeHtml(item.updatedBy) + "</small>" : "") + "</td><td>" + escapeHtml(item.venue || "—") + "</td></tr>";
    });
    const nextLesson = schedule[0];
    setText("statNextLesson", nextLesson.subject);
    setAdjacentText("statNextLesson", nextLesson.day + " · " + nextLesson.time);
  } else {
    dashTimetableRows = emptyRow(3, "No timetable has been published for this student yet.");
    fullTimetableRows = emptyRow(5, "No timetable has been published for this student yet.");
    setText("statNextLesson", "—");
    setAdjacentText("statNextLesson", "No lessons scheduled");
  }
  setHtml("dashTimetableBody", dashTimetableRows);
  setHtml("fullTimetableBody", fullTimetableRows);

  const updates = Array.isArray(student.updates) ? student.updates : [];
  const latestUpdate = updates.length ? [...updates].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] : null;
  const updateNotice = byId("portalUpdateNotice");
  if (updateNotice) {
    if (latestUpdate) {
      updateNotice.classList.remove("hidden");
      setText("portalUpdateTitle", latestUpdate.title);
      setText("portalUpdateMessage", latestUpdate.message);
      setText(
        "portalUpdateMeta",
        (latestUpdate.category || "Portal Update") + " · " + (latestUpdate.date || latestUpdate.createdAt || "") +
          (latestUpdate.createdBy ? " · Sent by " + latestUpdate.createdBy : "")
      );
    } else {
      updateNotice.classList.add("hidden");
    }
  }

  const individualUpdates = updates.map((update) => ({ ...update, individual: true }));
  let announcementHtml = "";
  [...individualUpdates, ...DEFAULT_ANNOUNCEMENTS].forEach((announcement) => {
    announcementHtml +=
      "<div style='padding:14px;border:1px solid var(--line);border-radius:10px;" + (announcement.individual ? "border-left:4px solid var(--crest-gold);background:var(--crest-gold-soft);" : "") + "'>" +
      "<small style='color:" + (announcement.individual ? "var(--crest-purple);" : "var(--crest-green);") + ";font-weight:700;'>" + escapeHtml(announcement.category || "Portal Update") + (announcement.individual ? " · Individual Update" : "") + " · " + escapeHtml(announcement.date || announcement.createdAt || "") + "</small>" +
      "<h3 style='margin:6px 0;font-size:15px;color:var(--ink-deep);'>" + escapeHtml(announcement.title) + "</h3>" +
      "<p style='margin:0;color:var(--muted);font-size:12px;'>" + escapeHtml(announcement.body || announcement.message) + "</p>" +
      (announcement.createdBy ? "<small class='update-meta' style='display:block;margin-top:8px;'>Sent by " + escapeHtml(announcement.createdBy) + "</small>" : "") +
      "</div>";
  });
  setHtml("announcementsContainer", announcementHtml);

  const profileFormSection = byId("profileEditForm");
  if (profileFormSection) {
    setValue("profileFullName", student.fullName || "");
    setValue("profileEmail", student.email || "");
    setValue("profileStudentId", student.studentId || "");
    setValue("profileClass", student.currentClass || "");
    setValue("profileAcademicYear", student.academicYear || ACADEMIC_YEAR);
    setValue("profileParentName", student.parentName || "");
    setValue("profileParentPhone", student.parentPhone || "");
    setValue("profileWhatsApp", student.whatsappNumber || "");
    setValue("profileHomeAddress", student.homeAddress || "");
    setValue("profileLoginCode", student.loginCode || "");
    const picPreview = byId("profilePicPreview");
    if (picPreview) picPreview.src = student.profilePic || "detlofcreast.svg";

    profileFormSection.onsubmit = function (event) {
      event.preventDefault();
      const nameField = byId("profileFullName");
      const typedName = nameField ? nameField.value.trim() : "";
      Object.assign(activeStudent, {
        fullName: typedName || activeStudent.fullName,
        updatedBy: "Student Self-Update",
        updatedAt: new Date().toISOString(),
      });
      // Persist the change against this student's synced record (saveSyncedStudents()
      // on its own only rewrites what is already in storage).
      upsertSyncedStudent(activeStudent);
      renderPortalForStudent(activeStudent);
      window.alert("Profile updated. Only your name can be changed; other details are managed by the school administrator.");
    };
  }

  setHtml("profileTableBody", "");
}

function switchTab(tabName) {
  const target = byId("tab-" + tabName);
  if (!target) return;
  document.querySelectorAll(".portal-tab").forEach((element) => element.classList.add("hidden"));
  target.classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-tab") === tabName);
  });
}

function logoutPortal() {
  activeStudent = null;
  try {
    sessionStorage.removeItem("detlof_portal_role");
    sessionStorage.removeItem("detlof_teacher");
  } catch {
    // Storage can be unavailable (private mode / file://) — logout still works.
  }
  const portalShell = byId("portalShell");
  const loginScreen = byId("loginScreen");
  if (portalShell) portalShell.classList.add("hidden");
  if (loginScreen) loginScreen.classList.remove("hidden");
  setValue("loginPassword", "");
}

const portalLoginForm = byId("portalLoginForm");
if (portalLoginForm) portalLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = (byId("loginEmail") || { value: "" }).value.trim().toLowerCase();
  const studentId = (byId("loginStudentId") || { value: "" }).value.trim().toUpperCase();
  const password = (byId("loginPassword") || { value: "" }).value.trim();
  const errorBox = byId("loginErrorBox");
  if (errorBox) errorBox.classList.add("hidden");

  const showLoginError = (message) => {
    if (!errorBox) { window.alert(message); return; }
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
  };

  const matchedLocal = findSyncedStudent({ email, studentId, loginCode: password });
  const payload = { email, studentId, password, syncedRecord: matchedLocal || null };
  let remoteStudent = null;
  let canUseLocal = false;

  const response = await fetchPortalApi("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response) {
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.student) remoteStudent = normalizeStudent(data.student);
    } else if (response.status === 401) {
      if (matchedLocal && window.location.protocol === "file:") {
        canUseLocal = true;
      } else {
        showLoginError("We could not sign you in with those details. Verify your Email, Student ID, and generated Login Code.");
        return;
      }
    } else {
      canUseLocal = true;
    }
  } else {
    canUseLocal = true;
  }

  if (remoteStudent) {
    renderPortalForStudent(remoteStudent);
    return;
  }

  if (matchedLocal && canUseLocal) {
    renderPortalForStudent(matchedLocal);
    return;
  }

  showLoginError("We could not sign you in with those details. Verify your Email, Student ID, and generated Login Code.");
});

function downloadMyLoginCode() {
  if (!activeStudent) { window.alert("Please sign in to download your login code."); return; }
  const content = [
    "Detlof Preparatory School - Student Portal Login",
    "Student: " + activeStudent.fullName,
    "Class: " + activeStudent.currentClass,
    "Student ID: " + activeStudent.studentId,
    "Student Email: " + activeStudent.email,
    "Login Code / PIN: " + activeStudent.loginCode,
    "",
    "Portal: detlof-student-portal.html",
  ].join("\r\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = activeStudent.studentId + "-portal-login.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadResultsPDF() {
  if (!activeStudent) { window.alert("Please sign in to download your results."); return; }
  const allTerms = getAllTermResults(activeStudent);
  const displayedTerm = activeStudent.displayedTerm || "all";
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Academic Results - ' + escapeHtml(activeStudent.fullName) + '</title>';
  html += '<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Inter, Arial, sans-serif;padding:40px;color:#2a1730;}';
  html += '.header{text-align:center;margin-bottom:30px;}';
  html += '.logo{width:110px;height:102px;}';
  html += '.subtitle{color:#75697a;font-size:12px;}';
  html += 'h1{color:#560f75;font-size:24px;margin:8px 0;}';
  html += '.info{color:#75697a;font-size:12px;margin:4px 0;}';
  html += 'table{width:100%;border-collapse:collapse;margin:16px 0;}';
  html += 'th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#75697a;padding:8px;border-bottom:1px solid #eadfe9;}';
  html += 'td{padding:8px;border-bottom:1px solid #eadfe9;font-size:12px;}';
  html += '.grade-pill{display:inline-block;width:24px;height:24px;border-radius:6px;font-weight:800;font-size:11px;background:#e5f3ea;color:#3f7d55;text-align:center;line-height:24px;}';
  html += '.gpa-box{background:#fffaf0;padding:14px;border-radius:8px;margin:16px 0;border-left:4px solid #f2b500;}';
  html += '.promo-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;}';
  html += '</style></head><body>';
  html += '<div class="header"><img class="logo" src="detlofcreast.svg" alt="Detlof Crest"><h1>DETLOF PREPARATORY SCHOOL</h1>';
  html += '<div class="subtitle">Student Academic Results Report</div>';
  html += '<div class="info">' + escapeHtml(activeStudent.fullName) + ' · ' + escapeHtml(activeStudent.studentId) + ' · ' + escapeHtml(activeStudent.currentClass || "KG 1") + '</div>';
  html += '<div class="info">Academic Year: ' + escapeHtml(activeStudent.academicYear || ACADEMIC_YEAR) + '</div></div>';

  const hasTermResults = Object.values(allTerms).some((t) => t != null);
  if (displayedTerm !== "all" && allTerms[displayedTerm]) {
    const termData = allTerms[displayedTerm];
    const label = { term1: "First Term", term2: "Second Term", term3: "Third Term" }[displayedTerm];
    html += '<h2 style="color:#560f75;font-size:18px;margin:20px 0 10px;">' + label + ' Results</h2>';
    html += renderResultsTableHTML(termData.results || []);
    html += renderTermSummaryBox(termData.results || [], label);
  } else if (hasTermResults) {
    const termLabels = { term1: "First Term", term2: "Second Term", term3: "Third Term" };
    Object.keys(termLabels).forEach((tk) => {
      const td = allTerms[tk];
      if (td && Array.isArray(td.results)) {
        html += '<h2 style="color:#560f75;font-size:18px;margin:20px 0 10px;">' + termLabels[tk] + ' Results</h2>';
        html += renderResultsTableHTML(td.results);
        html += renderTermSummaryBox(td.results, termLabels[tk]);
      }
    });
  }

  const annualAverage = calculateCumulativeGPA(activeStudent);
  if (annualAverage != null) {
    const promoStatus = activeStudent.promotionStatus || calculatePromotionStatus(activeStudent);
    const promoText = { promoted: "Promoted", on_try: "On Trial", repeated: "Repeating", not_promoted: "Not Promoted", pending: "" }[promoStatus] || "";
    html += '<div class="gpa-box"><strong>Annual Average: ' + annualAverage + '%</strong>';
    if (promoText) html += ' · <span class="promo-badge" style="background:#e5f3ea;color:#3f7d55;">' + promoText + '</span>';
    html += '</div>';
  } else {
    const sr = Array.isArray(activeStudent.results) ? activeStudent.results : DEFAULT_RESULTS;
    if (sr.length) {
      html += '<div class="gpa-box"><strong>Overall Average: ' + Math.round(sr.reduce((t, r) => t + Number(r.totalScore || 0), 0) / sr.length) + '%</strong></div>';
    }
  }

  html += '<div style="margin-top:30px;font-size:11px;color:#75697a;text-align:center;">Generated from Detlof Student Portal · ' + new Date().toLocaleDateString("en-GB") + '</div>';
  html += '</body></html>';

  const printWindow = window.open("", "_blank");
  if (!printWindow) { window.alert("Please allow pop-ups to preview and download results."); return; }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(function () { printWindow.print(); }, 500);
}

function renderResultsTableHTML(results) {
  let html = '<table><thead><tr><th>Subject</th><th>Class Score</th><th>Exam Score</th><th>Total</th><th>Grade</th></tr></thead><tbody>';
  results.forEach((r) => {
    const classScore = Number(r.classScore || 0);
    const examScore = Number(r.examScore || 0);
    const total = Math.round((classScore + examScore) * 100) / 100;
    const grade = r.grade || calculateGrade(total);
    html += "<tr><td><strong>" + escapeHtml(r.subject) + "</strong></td><td>" + escapeHtml(classScore) + "</td><td>" + escapeHtml(examScore) + "</td><td><strong>" + escapeHtml(total) + "</strong></td><td>" + gradePillHTML(grade) + "</td></tr>";
  });
  html += "</tbody></table>";
  return html;
}

function renderTermSummaryBox(results, label) {
  if (!results || !results.length) return "";
  const avg = calculateTermAverage(results);
  const gpa = calculateTermGPA(results);
  let dist = {};
  results.forEach((r) => {
    const g = r.grade || calculateGrade(r.totalScore || (Number(r.classScore || 0) + Number(r.examScore || 0)));
    dist[g] = (dist[g] || 0) + 1;
  });
  const distStr = Object.keys(dist).sort().map((g) => g + "×" + dist[g]).join(", ");
  return '<div class="gpa-box"><strong>' + label + ' Average: ' + (avg != null ? avg + "%" : "—") + '</strong> · <strong>GPA: ' + (gpa != null ? gpa : "—") + '</strong> · <span style="color:#75697a;">' + distStr + '</span></div>';
}

function gradePillHTML(grade) {
  const colors = { A: "#e5f3ea", B: "#fff3c4", C: "#ffe4ea", D: "#f3e7f7", E: "#ffe0e0", F: "#ffcccc" };
  const textColors = { A: "#3f7d55", B: "#b87a00", C: "#d9003b", D: "#560f75", E: "#b00", F: "#c00" };
  const bg = colors[grade] || "#ffe4ea";
  const tc = textColors[grade] || "#d9003b";
  return '<span class="grade-pill" style="background:' + bg + ';color:' + tc + ';">' + escapeHtml(grade) + '</span>';
}

function downloadTimetablePDF() {
  if (!activeStudent) { window.alert("Please sign in to download your timetable."); return; }
  const defaultSchedule = [
    { day: "Monday", time: "8:00 – 9:00", subject: "Mathematics", teacher: "Mrs. Addo", venue: (activeStudent.currentClass || "KG 1") + " Room" },
    { day: "Monday", time: "9:00 – 10:00", subject: "English Language", teacher: "Mr. Mensah", venue: (activeStudent.currentClass || "KG 1") + " Room" },
    { day: "Tuesday", time: "8:00 – 9:00", subject: "Integrated Science", teacher: "Mrs. Owusu", venue: (activeStudent.currentClass || "KG 1") + " Room" },
    { day: "Wednesday", time: "10:30 – 11:30", subject: "Computing / ICT", teacher: "Mr. Kofi", venue: "ICT Lab" },
    { day: "Thursday", time: "11:30 – 12:30", subject: "Social Studies", teacher: "Ms. Aidoo", venue: (activeStudent.currentClass || "KG 1") + " Room" },
  ];
  const schedule = Array.isArray(activeStudent.timetable) ? sortedSchedule(activeStudent.timetable) : defaultSchedule;

  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Class Timetable - ' + escapeHtml(activeStudent.fullName) + '</title>';
  html += '<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Inter, Arial, sans-serif;padding:40px;color:#2a1730;}';
  html += '.header{text-align:center;margin-bottom:30px;}';
  html += '.logo{width:110px;height:102px;}';
  html += '.subtitle{color:#75697a;font-size:12px;}';
  html += 'h1{color:#560f75;font-size:24px;margin:8px 0;}';
  html += '.info{color:#75697a;font-size:12px;margin:4px 0;}';
  html += 'table{width:100%;border-collapse:collapse;margin:16px 0;}';
  html += 'th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#75697a;padding:8px;border-bottom:2px solid #eadfe9;}';
  html += 'td{padding:8px;border-bottom:1px solid #eadfe9;font-size:12px;}';
  html += '</style></head><body>';
  html += '<div class="header"><img class="logo" src="detlofcreast.svg" alt="Detlof Crest"><h1>DETLOF PREPARATORY SCHOOL</h1>';
  html += '<div class="subtitle">Weekly Class Timetable</div>';
  html += '<div class="info">' + escapeHtml(activeStudent.currentClass || "KG 1") + ' · ' + escapeHtml(activeStudent.academicYear || ACADEMIC_YEAR) + '</div>';
  html += '<div class="info">' + escapeHtml(activeStudent.fullName) + ' · ' + escapeHtml(activeStudent.studentId) + '</div></div>';
  html += '<table><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Venue</th></tr></thead><tbody>';
  if (schedule.length) {
    schedule.forEach((item) => {
      html += "<tr><td><strong>" + escapeHtml(item.day) + "</strong></td><td>" + escapeHtml(item.time) + "</td><td>" + escapeHtml(item.subject) + "</td><td>" + escapeHtml(item.teacher || "Not assigned") + "</td><td>" + escapeHtml(item.venue || "—") + "</td></tr>";
    });
  } else {
    html += '<tr><td colspan="5" style="text-align:center;color:#75697a;padding:20px;">No timetable has been published.</td></tr>';
  }
  html += "</tbody></table>";
  html += '<div style="margin-top:30px;font-size:11px;color:#75697a;text-align:center;">Generated from Detlof Student Portal · ' + new Date().toLocaleDateString("en-GB") + '</div>';
  html += '</body></html>';

  const printWindow = window.open("", "_blank");
  if (!printWindow) { window.alert("Please allow pop-ups to preview and download your timetable."); return; }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(function () { printWindow.print(); }, 500);
}

function downloadMyTimetable() {
  if (!activeStudent) { window.alert("Please sign in to download your timetable."); return; }
  downloadTimetablePDF();
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && activeStudent) {
    const updated = getSyncedStudents().find(
      (student) => String(student.studentId).toUpperCase() === String(activeStudent.studentId).toUpperCase()
    );
    if (updated) renderPortalForStudent(updated);
  }
});

const termFilter = document.getElementById("resultsTermFilter");
if (termFilter) {
  termFilter.addEventListener("change", (e) => {
    if (!activeStudent) return;
    activeStudent.displayedTerm = e.target.value;
    renderPortalForStudent(activeStudent);
  });
}

const downloadResultsBtn = document.getElementById("downloadResultsPdfBtn");
if (downloadResultsBtn) {
  downloadResultsBtn.onclick = downloadResultsPDF;
}
const downloadTimetableBtn = document.getElementById("downloadTimetablePdfBtn");
if (downloadTimetableBtn) {
  downloadTimetableBtn.onclick = downloadTimetablePDF;
}
