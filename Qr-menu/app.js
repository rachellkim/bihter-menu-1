// ===== CONFIG =====
const API_URL = "/api/menu";

// Ana sayfada görünecek 6 ANA kategori slug'ı
const MAIN_SLUGS = [
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "tatlilar",
  "kahvaltiliklar",
];

// ANA → ALT kategori eşlemesi
const SUB_MAP = {
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtreturk"],
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],
  "sicak-icecekler": [],
  "soguk-icecekler": [],
  "tatlilar": [],
  "kahvaltiliklar": [],
};

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k) || "";

const getSlug = (c) =>
  c?.slug || c?.["slug(text)"] || c?.slugText || "";

const getTitle = (c) =>
  c?.titleTR || c?.["Kategori TR"] || c?.title || c?.name || "";

const getHeroUrl = (c) =>
  c?.heroUrl ||
  c?.coverUrl ||
  c?.["Kapak Foto"]?.[0]?.url ||
  "";

const formatPrice = (p) => {
  const s = String(p ?? "").trim();
  if (!s) return "";
  if (/^\d+([.,]\d+)?$/.test(s)) return s.replace(",", ".") + "₺";
  return s;
};

// 🔥 FOTOĞRAF OKUMA (ASIL OLAY)
const getProductImage = (it) =>
  it?.["Ürün Fotoğrafı"]?.[0]?.url ||
  it?.["Urun Fotograf"]?.[0]?.url ||
  it?.photo?.[0]?.url ||
  it?.image?.[0]?.url ||
  "";

// ===== API =====
async function getMenu() {
  const r = await fetch(API_URL, { cache: "no-store" });
  if (!r.ok) throw new Error("API hata: " + r.status);
  return r.json();
}

const findCategory = (data, slug) =>
  (data?.categories || []).find((c) => getSlug(c) === slug);

// ===== HERO =====
function setHero(cat) {
  const img = document.getElementById("heroImg");
  const txt = document.getElementById("heroText");
  if (txt) txt.textContent = getTitle(cat);
  if (img) {
    const url = getHeroUrl(cat);
    if (url) img.src = url;
  }
}

// ===== INDEX =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  const map = new Map((data.categories || []).map(c => [getSlug(c), c]));
  box.innerHTML = "";

  for (const slug of MAIN_SLUGS) {
    const cat = map.get(slug);
    if (!cat) continue;

    const a = document.createElement("a");
    a.className = "btn";
    a.textContent = getTitle(cat);
    a.href = SUB_MAP[slug]?.length
      ? `/sub.html?main=${slug}`
      : `/category/?cat=${slug}`;

    box.appendChild(a);
  }
}

// ===== SUB =====
function renderSub(data) {
  const box = document.getElementById("subButtons");
  if (!box) return;

  const main = qs("main");
  const cat = findCategory(data, main);
  if (!cat) return;

  setHero(cat);
  box.innerHTML = "";

  const subs = SUB_MAP[main] || [];
  if (!subs.length) {
    location.href = `/category/?cat=${main}`;
    return;
  }

  for (const s of subs) {
    const c = findCategory(data, s);
    const a = document.createElement("a");
    a.className = "btn";
    a.textContent = c ? getTitle(c) : s;
    a.href = `/category/?cat=${s}`;
    box.appendChild(a);
  }
}

// ===== CATEGORY (ÜRÜNLER) =====
function renderCategory(data) {
  const box = document.getElementById("items");
  if (!box) return;

  const slug = qs("cat");
  const cat = findCategory(data, slug);
  if (!cat) {
    box.innerHTML = `<p style="text-align:center;opacity:.6">Kategori bulunamadı.</p>`;
    return;
  }

  setHero(cat);
  const title = document.getElementById("catTitle");
  if (title) title.textContent = getTitle(cat);

  box.innerHTML = "";

  for (const it of cat.items || []) {
    const card = document.createElement("article");
    card.className = "item";

    const imgUrl = getProductImage(it);

    card.innerHTML = `
      <div class="itemMain">
        <h3 class="itemName">${it["Ürün Adı"] || ""}</h3>
        ${it["Açıklama TR"] ? `<p class="itemDesc">${it["Açıklama TR"]}</p>` : ""}
      </div>
      <div class="itemRight">
        <div class="price">${formatPrice(it["Fiyat"])}</div>
        ${imgUrl ? `<img class="thumb" src="${imgUrl}" alt="">` : ""}
      </div>
    `;

    box.appendChild(card);
  }
}

// ===== TO TOP =====
function setupToTop() {
  const b = document.getElementById("toTopBtn");
  if (!b) return;
  b.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  addEventListener("scroll", () => {
    b.style.display = scrollY > 400 ? "block" : "none";
  });
}

// ===== BOOT =====
(async () => {
  try {
    setupToTop();
    const data = await getMenu();
    renderIndex(data);
    renderSub(data);
    renderCategory(data);
  } catch (e) {
    console.error(e);
  }
})();
