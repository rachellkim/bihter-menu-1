// ================= CONFIG =================
const API_URL = "/api/menu";

// Ana menüde görünecek 6 kategori (Airtable slug’ları!)
const MAIN_SLUGS = [
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "tatlilar",
  "kahvaltiliklar",
];

// Ana kategori → alt kategori eşleşmesi
const SUB_MAP = {
  "sicak-kahveler": [
    "espresso-bazli",
    "aromali-ozel-kahveler",
    "filtreturk",
  ],
  "soguk-kahveler": [
    "sogukbazli",
    "soguk-matchalar",
    "frappeler",
  ],

  // alt kategori yok → direkt ürün listesi
  "sicak-icecekler": [],
  "soguk-icecekler": [],
  "tatlilar": [],
  "kahvaltiliklar": [],
};

// ================= HELPERS =================
const qs = (k) => new URLSearchParams(location.search).get(k);

const normTR = (s = "") =>
  s
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");

// ================= LOAD =================
document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetch(API_URL).then((r) => r.json());

  const cat = qs("cat");

  if (!cat) {
    renderIndex(data);
  } else if (SUB_MAP[cat] && SUB_MAP[cat].length > 0) {
    renderSubCategories(data, cat);
  } else {
    renderProducts(data, cat);
  }
});

// ================= RENDER INDEX =================
function renderIndex(data) {
  const wrap = document.querySelector(".menu-buttons");
  wrap.innerHTML = "";

  MAIN_SLUGS.forEach((slug) => {
    const cat = data.categories.find((c) => c.slug === slug);
    if (!cat) return;

    wrap.innerHTML += `
      <a class="btn" href="category/?cat=${cat.slug}">
        ${cat.titleTR}
      </a>
    `;
  });
}

// ================= SUB CATEGORIES =================
function renderSubCategories(data, parentSlug) {
  const wrap = document.querySelector(".menu-buttons");
  wrap.innerHTML = "";

  SUB_MAP[parentSlug].forEach((slug) => {
    const cat = data.categories.find((c) => c.slug === slug);
    if (!cat) return;

    wrap.innerHTML += `
      <a class="btn" href="category/?cat=${cat.slug}">
        ${cat.titleTR}
      </a>
    `;
  });
}

// ================= PRODUCTS =================
function renderProducts(data, slug) {
  const cat = data.categories.find((c) => c.slug === slug);
  if (!cat) return;

  document.querySelector(".catTitle").innerText = cat.titleTR;

  const list = document.querySelector(".items");
  list.innerHTML = "";

  cat.items.forEach((p) => {
    list.innerHTML += `
      <div class="item">
        <div class="itemMain">
          <h3 class="itemName">${p.name}</h3>
          ${p.desc ? `<p class="itemDesc">${p.desc}</p>` : ""}
        </div>

        <div class="itemRight">
          <div class="price">${p.priceText || ""}</div>
          ${
            p.photoUrl
              ? `<img class="thumb" src="${p.photoUrl}" />`
              : ""
          }
        </div>
      </div>
    `;
  });
}
