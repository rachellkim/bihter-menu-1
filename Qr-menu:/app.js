// ===== CONFIG =====
const API_URL = "/api/menu";

// 6 ana kategori slug (Airtable slug(text))
const MAIN_SLUGS = [
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "tatlilar",
  "kahvaltiliklar",
];

// Ana -> Alt (Airtable slug’larıyla)
// (Burayı kendi Airtable slug’larına göre düzenleyeceğiz)
const SUB_MAP = {
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtreturk"],
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],
  "sicak-icecekler": [],   // alt yoksa direkt ürün sayfasına gider
  "soguk-icecekler": [],
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

  // 1) slug ile
  let cat = categories.find((c) => (c.slug || "") === slugOrTitle);
  if (cat) return cat;

  // 2) titleTR ile fallback
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

// ===== RENDER: INDEX (6 ANA) =====
async function renderIndex(categories) {
  const btnWrap = document.getElementById("categoryButtons");
  if (!btnWrap) return;

  // Sadece 6 ana kategoriyi göster
  const mains = categories
    .filter((c) => MAIN_SLUGS.includes(c.slug))
    .sort((a, b) => MAIN_SLUGS.indexOf(a.slug) - MAIN_SLUGS.indexOf(b.slug));

  btnWrap.innerHTML = mains
    .map(
      (c) => `
        <a class="btn" href="/sub.html?main=${encodeURIComponent(c.slug)}">
          ${c.titleTR || ""}
        </a>
      `
    )
    .join("");

  // ÖNEMLİ: ana sayfada products render edilmesin
  // (index (3).html içinde altta ekstra #items var; bunu ignore ediyoruz)
}

// ===== RENDER: SUB (ALT KATEGORİ) =====
async function renderSub(categories) {
  const subWrap = document.getElementById("subButtons");
  if (!subWrap) return;

  const mainSlug = qs("main");
  const mainCat = findCategory(categories, mainSlug);

  const heroText = document.getElementById("heroText");
  if (heroText) heroText.textContent = mainCat?.titleTR || "";

  const heroImg = document.getElementById("heroImg");
  if (heroImg) {
    // coverPhoto alanı varsa bas; yoksa gizle
    if (mainCat?.coverPhoto) {
      heroImg.src = mainCat.coverPhoto;
      heroImg.style.display = "block";
    } else {
      heroImg.style.display = "none";
    }
  }

  const subSlugs = SUB_MAP[mainSlug] || [];

  // alt yoksa direkt ürün sayfasına gönder (fallback)
  if (subSlugs.length === 0) {
    subWrap.innerHTML = `
      <a class="btn" href="/category/?cat=${encodeURIComponent(mainSlug)}">
        Ürünleri Gör
      </a>
    `;
    return;
  }

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

// ===== RENDER: CATEGORY (ÜRÜN) =====
async function renderCategory(categories) {
  const itemsWrap = document.getElementById("items");
  if (!itemsWrap) return;

  const catParam = qs("cat");
  if (!catParam) return;

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

  const categories = await loadCategories();

  // Sayfaya göre doğru render
  if (document.getElementById("categoryButtons")) {
    await renderIndex(categories);
  }
  if (document.getElementById("subButtons")) {
    await renderSub(categories);
  }
  if (document.getElementById("items") && qs("cat")) {
    await renderCategory(categories);
  }
});
