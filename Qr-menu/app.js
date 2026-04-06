// ===== CONFIG =====
const API_URL = "https://raw.githubusercontent.com/rachellkim/menu-json/main/menu.json";

const SUB_MAP = {
  "atistirmaliklar": [],
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtreturk", "sicak-matcha"],
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],
  "sicak-icecekler": [],
  "soguk-icecekler": [],
  "tatlilar": [],
};

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k) || "";
const norm = (s) => String(s ?? "").trim().toLowerCase();

// ===== FETCH =====
async function getMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Menu fetch error: " + res.status);
  const json = await res.json();
  return json.categories || [];
}

// ===== INDEX (OTOMATİK) =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  box.innerHTML = "";

  data.forEach(cat => {
    const slug = cat.slug;
    const hasSubs = SUB_MAP[slug]?.length > 0;

    const href = hasSubs
      ? `/sub.html?main=${slug}`
      : `/category/?cat=${slug}`;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.textContent = cat.name;

    box.appendChild(a);
  });
}

// ===== SUB PAGE =====
function renderSub(data) {
  const box = document.getElementById("subButtons");
  const titleEl = document.getElementById("subTitle");
  if (!box) return;

  const mainSlug = qs("main");
  const mainCat = data.find(c => norm(c.slug) === norm(mainSlug));

  if (!mainCat) return;

  if (titleEl) titleEl.textContent = mainCat.name;

  const subs = SUB_MAP[mainSlug] || [];
  box.innerHTML = "";

  if (!subs.length) {
    location.href = `/category/?cat=${mainSlug}`;
    return;
  }

  subs.forEach(subSlug => {
    const cat = data.find(c => norm(c.slug) === norm(subSlug));

    const a = document.createElement("a");
    a.className = "btn";
    a.href = `/category/?cat=${subSlug}`;
    a.textContent = cat ? cat.name : subSlug;

    box.appendChild(a);
  });
}

// ===== CATEGORY =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  // SADECE ANA KATEGORİLER
  const MAIN_CATEGORIES = [
    "tatlilar",
    "soguk-kahveler",
    "sicak-kahveler",
    "soguk-icecekler",
    "sicak-icecekler",
    "atistirmaliklar",
    "sicak-matcha"
  ];

  box.innerHTML = "";

  data.forEach(cat => {
    if (!MAIN_CATEGORIES.includes(cat.slug)) return;

    const hasSubs = SUB_MAP[cat.slug]?.length > 0;

    const href = hasSubs
      ? `/sub.html?main=${cat.slug}`
      : `/category/?cat=${cat.slug}`;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.textContent = cat.name;

    box.appendChild(a);
  });
}

// ===== TO TOP =====
function setupToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 400 ? "block" : "none";
  });

  btn.style.display = "none";
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    setupToTop();

    const data = await getMenu();

    renderIndex(data);
    renderSub(data);
    renderCategory(data);

  } catch (e) {
    console.error(e);

    const box =
      document.getElementById("categoryButtons") ||
      document.getElementById("subButtons") ||
      document.getElementById("items");

    if (box) {
      box.innerHTML = "<p style='color:red;text-align:center'>Yüklenemedi</p>";
    }
  }
});
