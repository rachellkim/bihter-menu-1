```javascript
// ===== CONFIG =====
const API_URL = "https://raw.githubusercontent.com/rachellkim/menu-json/main/menu.json";

// Ana sayfada görünecek ana kategori slug'ları
const MAIN_SLUGS = [
  "tatlilar",
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "atistirmaliklar",
  "sicak-matcha",
];

// ===== SUB CATEGORY MAP =====
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
const normTR = (s) => String(s ?? "").trim();
const getSlug = (cat) => cat?.slug || "";
const getTitle = (cat) => cat?.name || "";

// ===== FETCH =====
async function getMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Menu fetch error: " + res.status);
  const json = await res.json();
  return json.categories || [];
}

// ===== INDEX =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  const catsBySlug = new Map(data.map((c) => [getSlug(c), c]));

  box.innerHTML = "";
  for (const slug of MAIN_SLUGS) {
    const cat = catsBySlug.get(slug);
    if (!cat) continue;

    const hasSubs = SUB_MAP[slug]?.length > 0;

    const href = hasSubs
      ? `/sub.html?main=${slug}`
      : `/category/?cat=${slug}`;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.textContent = getTitle(cat);
    box.appendChild(a);
  }
}

// ===== SUB PAGE =====
function renderSub(data) {
  const box = document.getElementById("subButtons");
  const titleEl = document.getElementById("subTitle");
  if (!box) return;

  const mainSlug = qs("main");
  const mainCat = data.find((c) => getSlug(c) === mainSlug);

  if (!mainCat) return;

  if (titleEl) titleEl.textContent = getTitle(mainCat);

  const subs = SUB_MAP[mainSlug] || [];
  box.innerHTML = "";

  if (!subs.length) {
    location.href = `/category/?cat=${mainSlug}`;
    return;
  }

  for (const subSlug of subs) {
    const cat = data.find((c) => getSlug(c) === subSlug);

    const a = document.createElement("a");
    a.className = "btn";
    a.href = `/category/?cat=${subSlug}`;
    a.textContent = cat ? getTitle(cat) : subSlug;
    box.appendChild(a);
  }
}

// ===== CATEGORY =====
function renderCategory(data) {
  const itemsBox = document.getElementById("items");
  const titleEl = document.getElementById("catTitle");
  if (!itemsBox) return;

  const slug = qs("cat");
  const cat = data.find((c) => getSlug(c) === slug);

  if (!cat) {
    itemsBox.innerHTML = `<p>Kategori bulunamadı</p>`;
    return;
  }

  if (titleEl) titleEl.textContent = getTitle(cat);

  const items = cat.products || [];
  itemsBox.innerHTML = "";

  for (const it of items) {
    const card = document.createElement("article");
    card.className = "item";

    card.innerHTML = `
      <div>
        <h3>${it.name}</h3>
        <p>${it.description_tr || ""}</p>
      </div>
      <div>
        <strong>${it.price_display || ""}</strong>
        ${it.image ? `<img src="${it.image}" width="120">` : ""}
      </div>
    `;

    itemsBox.appendChild(card);
  }
}

// ===== INIT =====
(async function init() {
  try {
    const data = await getMenu();
    renderIndex(data);
    renderSub(data);
    renderCategory(data);
  } catch (e) {
    console.error(e);
  }
})();
```
