// ===== CONFIG =====
const API_URL = "/api/menu";

// Ana sayfada görünecek 6 ANA kategori slug'ı (Airtable slug(text))
const MAIN_SLUGS = [
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "tatlilar",
  "kahvaltiliklar",
];

// ANA -> ALT kategori eşleşmesi (Airtable slug'larıyla birebir)
const SUB_MAP = {
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtretturk"],
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],

  // Alt kategori yoksa boş bırak (direkt ürün sayfasına gidecek)
  "sicak-icecekler": [],
  "soguk-icecekler": [],
  "tatlilar": [],
  "kahvaltiliklar": [],
};

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k);

function normTR(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function priceText(p) {
  if (p === null || p === undefined) return "";
  const str = String(p).trim();
  // "180" -> "180₺", "180₺" aynen kalsın
  if (!str) return "";
  return str.includes("₺") ? str : `${str}₺`;
}

async function getMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("API hata: " + res.status);
  return res.json();
}

// Menü datasında kategori slug'ını yakalamak için esnek bulucu
function catSlug(cat) {
  return (
    cat?.slug ||
    cat?.slugTR ||
    cat?.slugText ||
    cat?.["slug(text)"] ||
    cat?.["slug"] ||
    ""
  );
}

function catTitleTR(cat) {
  return cat?.titleTR || cat?.title || cat?.nameTR || cat?.name || "";
}

function catHeroUrl(cat) {
  // Airtable'dan kapak foto alanına göre uyarlayabilirsin
  return (
    cat?.coverPhoto ||
    cat?.kapakFoto ||
    cat?.imageUrl ||
    cat?.photoUrl ||
    cat?.["Kapak Foto"] ||
    ""
  );
}

function findCategory(data, slug) {
  const target = normTR(slug);
  return (data.categories || []).find((c) => normTR(catSlug(c)) === target);
}

// Ürün alanları esnek
function itemName(it) {
  return it?.["Ürün Adı"] || it?.["Urun Adi"] || it?.name || it?.title || "";
}
function itemDescTR(it) {
  return it?.["Açıklama TR"] || it?.["Aciklama TR"] || it?.descTR || it?.desc || "";
}
function itemPrice(it) {
  return it?.["Fiyat"] || it?.price || it?.priceText || it?.["Price"] || "";
}
function itemPhoto(it) {
  return it?.photoUrl || it?.imageUrl || it?.img || it?.["Foto"] || "";
}

// ===== RENDERERS =====
function renderIndex(categories) {
  const wrap = document.getElementById("buttons");
  if (!wrap) return;

  // sadece 6 ana slug ve sırayla
  const bySlug = new Map(categories.map((c) => [normTR(catSlug(c)), c]));

  wrap.innerHTML = MAIN_SLUGS.map((slug) => {
    const c = bySlug.get(normTR(slug));
    if (!c) return ""; // yoksa hiç basma
    const title = catTitleTR(c) || slug;
    return `<a class="btn" href="/sub.html?cat=${encodeURIComponent(slug)}">${title}</a>`;
  }).join("");
}

function renderSub(data, mainSlug) {
  const cat = findCategory(data, mainSlug);

  // başlık/hero
  const titleEl = document.getElementById("catTitle2");
  const heroEl = document.getElementById("catHero");

  if (titleEl) titleEl.textContent = cat ? catTitleTR(cat) : mainSlug;
  if (heroEl) {
    const h = cat ? catHeroUrl(cat) : "";
    if (h) {
      heroEl.src = h;
      heroEl.style.display = "block";
    } else {
      heroEl.style.display = "none";
    }
  }

  const subs = SUB_MAP[mainSlug] || [];

  // alt kategori yoksa direkt ürün sayfasına
  if (!subs.length) {
    location.replace(`/category/?cat=${encodeURIComponent(mainSlug)}`);
    return;
  }

  const wrap = document.getElementById("subButtons");
  if (!wrap) return;

  wrap.innerHTML = subs
    .map((subSlug) => {
      const subCat = findCategory(data, subSlug);
      const label = subCat ? catTitleTR(subCat) : subSlug;
      return `<a class="btn" href="/category/?cat=${encodeURIComponent(subSlug)}">${label}</a>`;
    })
    .join("");
}

function renderCategory(data, slug) {
  const cat = findCategory(data, slug);

  const titleEl = document.getElementById("catTitle");
  if (titleEl) titleEl.textContent = cat ? catTitleTR(cat) : slug;

  const list = document.getElementById("items");
  if (!list) return;

  const items = (cat?.items || []).map((it) => {
    const name = itemName(it);
    const desc = itemDescTR(it);
    const price = priceText(itemPrice(it));
    const photo = itemPhoto(it);

    return `
      <div class="item">
        <div class="itemMain">
          <h3 class="itemName">${name || ""}</h3>
          ${desc ? `<div class="itemDesc">${desc}</div>` : ""}
        </div>

        <div class="itemRight">
          <div class="price">${price}</div>
          ${photo ? `<img class="thumb" src="${photo}" alt="${name || ""}" loading="lazy">` : ""}
        </div>
      </div>
    `;
  });

  list.innerHTML = items.join("") || `<div style="padding:12px;color:rgba(0,0,0,.6)">Bu kategoride ürün yok.</div>`;
}

// ===== BOOT =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await getMenu();

    // hangi sayfadayız?
    const hasIndex = !!document.getElementById("buttons");
    const hasSub = !!document.getElementById("subButtons");
    const hasCat = !!document.getElementById("items");

    if (hasIndex) {
      renderIndex(data.categories || []);
      return;
    }

    if (hasSub) {
      const mainSlug = qs("cat") || "";
      renderSub(data, mainSlug);
      return;
    }

    if (hasCat) {
      const slug = qs("cat") || "";
      renderCategory(data, slug);
      return;
    }
  } catch (e) {
    console.error(e);
  }
});
