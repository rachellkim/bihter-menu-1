// ===== CONFIG =====
const API_URL = "/api/menu";

// Ana sayfada görünecek 6 ANA kategori slug'ı (Airtable slug(text) ile birebir!)
const MAIN_SLUGS = [
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "tatlilar",
  "kahvaltiliklar",
];

/**
 * ANA -> ALT kategori eşleşmesi (Airtable slug(text) ile birebir!)
 * Bir ana kategorinin array'i boşsa, direkt /category sayfasına gider.
 */
const SUB_MAP = {
  // Soğuk Kahveler -> 3 alt kategori
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],

  // Sıcak Kahveler -> 3 alt kategori
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtreturk"],

  // Bunlar direkt ürün listesi gösteriyor (istersen sonradan doldurursun)
  "sicak-icecekler": [],
  "soguk-icecekler": [],
  "tatlilar": [],
  "kahvaltiliklar": [],
};

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k) || "";
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Airtable/JSON farklı isimlerle gelebilir diye esnek okuyoruz
function pick(obj, keys, fallback = "") {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== "") return obj[k];
  }
  return fallback;
}

async function fetchMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  // Beklenen: { categories: [...] }
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  return categories;
}

function getSlug(cat) {
  // slug field’ları farklı gelebilir
  return String(
    pick(cat, ["slug", "Slug", "slug(text)", "slugText", "slug_text"], "")
  ).trim();
}

function getTitle(cat) {
  return String(pick(cat, ["titleTR", "Kategori TR", "title", "nameTR"], "")).trim();
}

function getCoverUrl(cat) {
  // Kapak foto alanını farklı isimlerle yakala
  // Airtable attachment bazen array olarak gelir
  const v = pick(cat, ["coverUrl", "Kapak Foto", "kapakFoto", "cover", "image"], "");
  if (Array.isArray(v) && v[0]?.url) return v[0].url;
  if (typeof v === "object" && v?.url) return v.url;
  return typeof v === "string" ? v : "";
}

function findCategory(categories, slug) {
  const s = String(slug || "").trim().toLowerCase();
  return categories.find((c) => getSlug(c).toLowerCase() === s) || null;
}

// ===== RENDER: INDEX (ana sayfa) =====
async function renderIndex() {
  const container = document.getElementById("categoryButtons");
  if (!container) return;

  const categories = await fetchMenu();

  // 6 ana kategori
  const mainCats = MAIN_SLUGS.map((slug) => findCategory(categories, slug)).filter(Boolean);

  container.innerHTML = mainCats
    .map((cat) => {
      const slug = getSlug(cat);
      const title = getTitle(cat) || slug;

      const hasSubs = Array.isArray(SUB_MAP[slug]) && SUB_MAP[slug].length > 0;

      // alt kategori varsa sub.html, yoksa category sayfası
      const href = hasSubs ? `/sub.html?cat=${encodeURIComponent(slug)}` : `/category/?cat=${encodeURIComponent(slug)}`;

      return `<a class="btn" href="${href}">${esc(title)}</a>`;
    })
    .join("");
}

// ===== RENDER: SUB (alt kategori listesi) =====
async function renderSub() {
  const container = document.getElementById("subButtons");
  const titleEl = document.getElementById("categoryTitle");
  if (!container || !titleEl) return;

  const mainSlug = qs("cat").trim();
  if (!mainSlug) {
    titleEl.textContent = "Kategori bulunamadı";
    container.innerHTML = "";
    return;
  }

  const categories = await fetchMenu();
  const mainCat = findCategory(categories, mainSlug);

  titleEl.textContent = getTitle(mainCat) || mainSlug;

  // Kapak görseli varsa göster
  const heroImg = document.getElementById("heroImg");
  if (heroImg) {
    const cover = mainCat ? getCoverUrl(mainCat) : "";
    if (cover) {
      heroImg.src = cover;
      heroImg.style.display = "block";
    } else {
      heroImg.style.display = "none";
    }
  }

  // Alt kategoriler
  const subs = SUB_MAP[mainSlug] || [];
  container.innerHTML = subs
    .map((subSlug) => {
      const subCat = findCategory(categories, subSlug);
      const label = getTitle(subCat) || subSlug;
      const href = `/category/?cat=${encodeURIComponent(subSlug)}`;
      return `<a class="btn" href="${href}">${esc(label)}</a>`;
    })
    .join("");

  // Geri link (varsa)
  const menuLink = document.getElementById("menuLink");
  if (menuLink) menuLink.href = "/";
}

// ===== RENDER: CATEGORY (ürün listesi) =====
function renderProducts(items, mount) {
  mount.innerHTML = items
    .map((it) => {
      const name = pick(it, ["name", "Ürün Adı", "Urun Adi", "title", "productName"], "");
      const desc = pick(it, ["descTR", "Açıklama", "Aciklama", "desc", "description"], "");
      const price = pick(it, ["priceText", "Fiyat", "price", "fiyat"], "");
      const photo = pick(it, ["photoUrl", "photo", "imageUrl", "img"], "");

      // isim - fiyat - foto (sağda foto büyür, CSS ile ayarlanır)
      return `
        <div class="item product-card">
          <div class="itemMain product-info">
            <h3 class="itemName product-title">${esc(name)}</h3>
            ${desc ? `<div class="itemDesc product-desc">${esc(desc)}</div>` : ""}
            ${price ? `<div class="price product-price">${esc(price)}</div>` : ""}
          </div>
          ${photo ? `<img class="thumb product-image" src="${esc(photo)}" alt="${esc(name)}">` : ""}
        </div>
      `;
    })
    .join("");
}

async function renderCategory() {
  const itemsEl = document.getElementById("items");
  const titleEl = document.getElementById("catTitle");
  if (!itemsEl || !titleEl) return;

  const slug = qs("cat").trim();
  if (!slug) {
    titleEl.textContent = "Kategori bulunamadı";
    itemsEl.innerHTML = "";
    return;
  }

  const categories = await fetchMenu();
  const cat = findCategory(categories, slug);

  titleEl.textContent = getTitle(cat) || slug;

  const items = Array.isArray(cat?.items) ? cat.items : [];
  renderProducts(items, itemsEl);

  setupToTop();
}

function setupToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;

  const toggle = () => {
    btn.style.display = window.scrollY > 300 ? "block" : "none";
  };

  window.addEventListener("scroll", toggle);
  toggle();

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ===== BOOT =====
(async function boot() {
  try {
    // Sayfada hangi container varsa ona göre render
    if (document.getElementById("categoryButtons")) {
      await renderIndex();
    } else if (document.getElementById("subButtons")) {
      await renderSub();
    } else if (document.getElementById("items")) {
      await renderCategory();
    }
  } catch (err) {
    console.error(err);
  }
})();
