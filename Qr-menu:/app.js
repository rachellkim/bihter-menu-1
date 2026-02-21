// ===== CONFIG =====
const API_URL = "/api/menu";

// Ana sayfada görünecek 6 ANA kategori slug’ı (Airtable'daki slug(text))
const MAIN_SLUGS = [
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "tatlilar",
  "kahvaltiliklar",
];

/**
 * ANA -> ALT kategori eşlemesi (Airtable slug’larıyla)
 * Burayı sadece Airtable’daki slug’lara göre düzenleyeceksin.
 */
const SUB_MAP = {
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtreturk"],
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],
  // Aşağıdakiler sende alt kategori olarak yoksa boş bırakabilirsin
  // veya bu ana kategorilerin ürünleri direkt category sayfasında gösterirsin.
  "sicak-icecekler": [],     // ör: ["caylar", "bitki-caylari", "sahlep"] gibi
  "soguk-icecekler": [],     // ör: ["limonatalar", "meyve-sulari", "churchill"] gibi
  "tatlilar": [],
  "kahvaltiliklar": [],
};

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k);

function normTR(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

async function loadCategories() {
  const res = await fetch(API_URL, { cache: "no-store" });
  const json = await res.json();
  return json.categories || [];
}

function findCategory(categories, slugOrTitle) {
  if (!slugOrTitle) return null;

  // önce slug ile dene
  let cat = categories.find((c) => (c.slug || "") === slugOrTitle);
  if (cat) return cat;

  // sonra titleTR ile (fallback)
  const needle = normTR(slugOrTitle);
  cat = categories.find((c) => normTR(c.titleTR) === needle);
  return cat || null;
}

function setupToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  const toggle = () => {
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
  };
  window.addEventListener("scroll", toggle);
  toggle();
}

// ===== RENDER: INDEX (6 ANA KATEGORİ) =====
async function renderIndex() {
  const btnWrap = document.getElementById("categoryButtons");
  if (!btnWrap) return;

  const categories = await loadCategories();
  const mains = categories.filter((c) => MAIN_SLUGS.includes(c.slug));

  btnWrap.innerHTML = mains
    .map(
      (c) => `
      <a class="btn" href="/sub.html?main=${encodeURIComponent(c.slug)}">
        ${c.titleTR || ""}
      </a>
    `
    )
    .join("");
}

// ===== RENDER: SUB (ALT KATEGORİLER) =====
async function renderSub() {
  const subWrap = document.getElementById("subButtons");
  if (!subWrap) return;

  const categories = await loadCategories();
  const mainSlug = qs("main");

  const mainCat = findCategory(categories, mainSlug);
  const heroText = document.getElementById("heroText");
  if (heroText) heroText.textContent = mainCat?.titleTR || "";

  // Alt kategori listesi
  const subSlugs = SUB_MAP[mainSlug] || [];

  // Eğer mapping boşsa: direkt o ana kategoriyi ürün sayfasına yönlendir (fallback)
  if (subSlugs.length === 0) {
    subWrap.innerHTML = `
      <a class="btn" href="/category/?cat=${encodeURIComponent(mainSlug)}">
        Ürünleri Gör
      </a>
    `;
    return;
  }

  // Airtable’da gerçekten var olan alt kategorileri filtrele
  const subs = subSlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);

  subWrap.innerHTML = subs
    .map(
      (c) => `
      <a class="btn" href="/category/?cat=${encodeURIComponent(c.slug)}">
        ${c.titleTR || ""}
      </a>
    `
    )
    .join("");
}

// ===== RENDER: CATEGORY (ÜRÜNLER) =====
async function renderCategory() {
  const itemsWrap = document.getElementById("items");
  if (!itemsWrap) return;

  const catParam = qs("cat");
  if (!catParam) return;

  const categories = await loadCategories();
  const cat = findCategory(categories, catParam);

  const titleEl = document.getElementById("catTitle");
  if (titleEl) titleEl.textContent = cat?.titleTR || "KATEGORİ";

  if (!cat || !Array.isArray(cat.items) || cat.items.length === 0) {
    itemsWrap.innerHTML =
      "<p style='text-align:center; padding:16px;'>Ürün bulunamadı</p>";
    return;
  }

  itemsWrap.innerHTML = cat.items
    .map(
      (p) => `
      <div class="item">
        <div class="itemMain">
          <div class="itemName">${p.name || ""}</div>
          ${p.desc ? `<div class="itemDesc">${p.desc}</div>` : ""}
        </div>
        <div class="itemRight">
          <div class="price">${p.price || ""}</div>
          ${
            p.image
              ? `<img class="thumb" src="${p.image}" alt="">`
              : `<div class="thumb"></div>`
          }
        </div>
      </div>
    `
    )
    .join("");
}

// ===== BOOT =====
document.addEventListener("DOMContentLoaded", async () => {
  setupToTop();
  await Promise.all([renderIndex(), renderSub(), renderCategory()]);
});
