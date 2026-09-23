/* ==========================================================
   موقع المحامية رنا رشوان — السكربت
   ========================================================== */

/* ---------- 1) بياناتك: عبّي اللي تبين تظهر، والفاضي يختفي تلقائيًا ---------- */
const CONFIG = {
  whatsapp: "966535383187",     // بصيغة دولية بدون + أو أصفار
  phone: "+966 53 538 3187",
  email: "Ranarshwan3@gmail.com",
  city: "",                     // مثال: "المدينة المنورة"
  license: "46118"              // رقم الترخيص
};

const WA_DEFAULT_TEXT = "السلام عليكم، أرغب بتقييم أولي لحالتي في مكافأة الخريجين.";

function waLink(text) {
  if (!CONFIG.whatsapp) return "#";
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text || WA_DEFAULT_TEXT)}`;
}

function applyConfig() {
  // إظهار/إخفاء الحقول
  document.querySelectorAll("[data-item]").forEach(wrap => {
    const key = wrap.dataset.item;
    if (!CONFIG[key]) { wrap.hidden = true; return; }
    wrap.querySelectorAll(`[data-field="${key}"]`).forEach(el => (el.textContent = CONFIG[key]));
  });
  // روابط واتساب
  document.querySelectorAll("[data-wa]").forEach(a => {
    a.href = waLink();
    if (CONFIG.whatsapp) { a.target = "_blank"; a.rel = "noopener"; }
  });
  // رابط الاتصال
  document.querySelectorAll("[data-tel]").forEach(a => {
    if (CONFIG.phone) a.href = "tel:" + CONFIG.phone.replace(/\s+/g, "");
  });
  // رابط الإيميل
  document.querySelectorAll("[data-mail]").forEach(a => {
    if (CONFIG.email) a.href = "mailto:" + CONFIG.email;
  });
}
applyConfig();

/* ---------- 2) القائمة في الجوال ---------- */
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("mainNav");
if (toggle && nav) toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
if (nav) nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

/* ---------- 3) تمييز الرابط النشط أثناء التمرير ---------- */
const navLinks = nav ? [...nav.querySelectorAll("a")].filter(a => (a.getAttribute("href") || "").startsWith("#")) : [];
const sections = navLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  let current = sections[0];
  sections.forEach(s => { if (s.offsetTop <= y) current = s; });
  if (current) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current.id));
  document.querySelector(".fab-top").classList.toggle("show", window.scrollY > 500);
}, { passive: true });

document.querySelector(".fab-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- 4) أداة الفحص الأولي ---------- */
// ok: الإجابة المتوافقة مع الضابط ("yes" أو "no")
// kind: rule = ضابط نظامي | doc = مستند | info = للعلم فقط
const QUESTIONS = [
  { kind: "rule", ok: "yes", label: "الدراسة بنظام الانتظام",
    q: "هل تخرجت من الجامعة بنظام الانتظام؟", hint: "وليس الانتساب أو التعليم عن بعد." },
  { kind: "rule", ok: "yes", label: "التعيين في جهة حكومية",
    q: "هل عُيّنت في جهة حكومية خاضعة لنظام الخدمة المدنية؟", hint: "" },
  { kind: "rule", ok: "yes", label: "تاريخ التعيين قبل 04/08/1419هـ",
    q: "هل كان تاريخ تعيينك قبل 04/08/1419هـ؟", hint: "راجع تاريخ مباشرتك في قرار التعيين." },
  { kind: "rule", ok: "no", label: "بدل السكن أو السكن العيني",
    q: "هل صُرف لك بدل سكن أو سكن عيني مع وظيفتك؟", hint: "" },
  { kind: "rule", ok: "no", label: "صرف المكافأة سابقًا",
    q: "هل سبق أن صُرفت لك مكافأة الخريجين؟", hint: "" },
  { kind: "doc", ok: "yes", label: "قرار التعيين",
    q: "هل يتوفر لديك قرار التعيين؟", hint: "يثبت تاريخ التعيين وجهة العمل." },
  { kind: "doc", ok: "yes", label: "وثيقة التخرج",
    q: "هل يتوفر لديك وثيقة التخرج؟", hint: "موضحًا بها تاريخ التخرج." },
  { kind: "doc", ok: "yes", label: "ما يثبت نظام الانتظام",
    q: "هل يتوفر لديك مستند يثبت أن دراستك كانت بالانتظام؟", hint: "قد يكون عبارة في الوثيقة نفسها." },
  { kind: "info", ok: null, label: "مطالبة سابقة",
    q: "هل سبق أن قدّمت مطالبة رسمية بالمكافأة؟", hint: "للعلم فقط، ولا يؤثر على النتيجة." }
];
const ANSWERS_LABEL = { yes: "نعم", no: "لا", unsure: "غير متأكد" };

const dlg = document.getElementById("checker");
const $ = id => document.getElementById(id);
const screens = ["ckIntro", "ckHelp", "ckQuiz", "ckResult"];
let idx = 0, answers = [];

function show(id) { screens.forEach(s => ($(s).hidden = s !== id)); }

function openChecker() {
  idx = 0; answers = [];
  show("ckIntro");
  if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
}
function closeChecker() { dlg.close(); }

function renderQuestion() {
  const item = QUESTIONS[idx];
  $("ckStep").textContent = `السؤال ${idx + 1} من ${QUESTIONS.length}`;
  $("ckBar").style.width = (idx / QUESTIONS.length) * 100 + "%";
  $("ckQuestion").textContent = item.q;
  $("ckHint").textContent = item.hint;
  $("ckHint").hidden = !item.hint;
  $("ckBack").hidden = idx === 0;
  const box = $("ckOptions");
  box.innerHTML = "";
  ["yes", "no", "unsure"].forEach(val => {
    const b = document.createElement("button");
    b.className = "ck-opt";
    b.textContent = ANSWERS_LABEL[val];
    b.addEventListener("click", () => {
      answers[idx] = val;
      idx++;
      idx < QUESTIONS.length ? renderQuestion() : showResult();
    });
    box.appendChild(b);
  });
}

function showResult() {
  const fails = [], unsure = [];
  QUESTIONS.forEach((item, i) => {
    if (item.kind === "info") return;
    const a = answers[i];
    if (a === "unsure") unsure.push(item);
    else if (a !== item.ok) fails.push(item);
  });

  let type, icon, title, text;
  if (fails.some(f => f.kind === "rule")) {
    type = "bad"; icon = "fa-circle-xmark";
    title = "لا تنطبق بعض الضوابط مبدئيًا";
    text = "بحسب إجاباتك لا يتوافق أحد الضوابط الأساسية. قد تكون هناك تفاصيل تغيّر التقدير، ويمكنك عرض حالتك على المكتب للتأكد.";
  } else if (fails.length || unsure.length) {
    type = "warn"; icon = "fa-circle-exclamation";
    title = "حالتك تحتاج مراجعة";
    text = "الضوابط الأساسية لا تتعارض مبدئيًا، لكن هناك نقاط غير مؤكدة أو مستندات ناقصة يلزم استكمالها.";
  } else {
    type = "good"; icon = "fa-circle-check";
    title = "تنطبق الضوابط مبدئيًا";
    text = "بحسب إجاباتك تتوافق حالتك مبدئيًا مع الضوابط. الفيصل النهائي هو فحص المستندات وحكم الجهة القضائية المختصة.";
  }

  $("ckResIcon").className = "ck-result-icon " + type;
  $("ckResIcon").innerHTML = `<i class="fa-solid ${icon}"></i>`;
  $("ckResTitle").textContent = title;
  $("ckResText").textContent = text;

  const list = $("ckResList");
  list.innerHTML = "";
  [...fails.map(f => ["لا يتوافق: ", f.label]), ...unsure.map(u => ["يحتاج تأكيد: ", u.label])].forEach(([pre, label]) => {
    const li = document.createElement("li");
    li.textContent = pre + label;
    list.appendChild(li);
  });
  list.hidden = !list.children.length;

  // نص واتساب فيه ملخص النتيجة (يرسله المستخدم بنفسه)
  const summary = QUESTIONS.map((it, i) => `- ${it.label}: ${ANSWERS_LABEL[answers[i]]}`).join("\n");
  const msg = `السلام عليكم، أجريت الفحص الأولي لمكافأة الخريجين.\nالنتيجة: ${title}\n${summary}`;
  const wa = $("ckResWa");
  wa.href = waLink(msg);
  if (CONFIG.whatsapp) { wa.target = "_blank"; wa.rel = "noopener"; }

  $("ckBar").style.width = "100%";
  show("ckResult");
}

document.querySelectorAll("[data-open-checker]").forEach(b => b.addEventListener("click", openChecker));
document.querySelector(".ck-close").addEventListener("click", closeChecker);
dlg.addEventListener("click", e => { if (e.target === dlg) closeChecker(); }); // الضغط خارج النافذة
$("ckStart").addEventListener("click", () => { idx = 0; answers = []; show("ckQuiz"); renderQuestion(); });
$("ckFaq").addEventListener("click", () => show("ckHelp"));
$("ckBackIntro").addEventListener("click", () => show("ckIntro"));
$("ckBack").addEventListener("click", () => { if (idx > 0) { idx--; renderQuestion(); } });
$("ckRestart").addEventListener("click", () => { idx = 0; answers = []; show("ckIntro"); });
