// ✅ /sub ve /sub.html ikisini de yakala
const path = location.pathname.replace(/\/$/, "");   // sondaki / varsa sil
const page = path.split("/").pop();                  // sub, sub.html, category, category.html vs.

const isSubPage = (page === "sub" || page === "sub.html");
const isCategoryPage = (page === "category" || page === "category.html");

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function formatPrice(x) {
  if (x == null) return "";
  const s = String(x).trim();
  if (!s) return "";
  const num = s.replace(/[^\d.,]/g, "");
  return `₺${num}`;
}

function normKey(x){
  return decodeURIComponent(String(x||""))
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

// ✅ MENÜ VERİSİ BURADA (SEN BURAYI DOLDURACAKSIN)
const MENU = [
  {
    slug: "sicak-kahveler",
    heroImage: "https://static.wixstatic.com/media/b9ef37_591321c950a04888aca57bd8292104f2~mv2.jpg",
    heroText: "",
    subcategories: [
      {
        slug: "espresso-bazli",
        titleTR: "Espresso Bazlı Kahveler",
        items: [
          { name: "Latte", descTR: "Espresso, süt", price: "600", image: "" },
          { name: "Americano", descTR: "Espresso, sıcak su", price: "600", image: "" }
        ]
      },
      {
        slug: "aromali",
        titleTR: "Aromalı Özel Kahveler",
        items: []
      },
      {
        slug: "filtre-turk",
        titleTR: "Filtre & Türk Kahvesi",
        items: []
      },
      {
        slug: "matchalar",
        titleTR: "Matchalar",
        items: []
      }
    ]
  },
  {
    slug: "soguk-kahveler",
    heroImage: "https://images.unsplash.com/photo-1523942839745-7848d936b3f9?auto=format&fit=crop&w=1200&q=60",
    heroText: "Matchalarımızı denediniz mi?",
    subcategories: [
      { slug: "espresso-bazli-soguklar", titleTR: "Espresso Bazlı Soğuklar", items: [] },
      { slug: "soguk-matchalar", titleTR: "Soğuk Matchalar", items: [] },
      { slug: "frappeler", titleTR: "Frappeler", items: [] }
    ]
  },

  // Bunlar direkt ürün listesine gidenler:
  {
    slug: "sicak-icecekler",
    titleTR: "Sıcak İçecekler",
    items: [
      { name: "Sıcak Çikolata", descTR: "", price: "250", image: "" }
    ]
  },
  { slug: "soguk-icecekler", titleTR: "Soğuk İçecekler", items: [] },
  { slug: "tatlilar", titleTR: "Tatlılar", items: [] },
  { slug: "kahvaltiliklar", titleTR: "Kahvaltılıklar", items: [] },
];

function findCat(slug){
  const key = normKey(slug);
  return MENU.find(c => normKey(c.slug) === key) || null;
}

// yukarı çık
function initToTop(){
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

async function renderSub(){
  const catSlug = getQueryParam("cat");
  const cat = findCat(catSlug);

  const heroImg = document.getElementById("heroImg");
  const heroText = document.getElementById("heroText");
  const wrap = document.getElementById("subButtons");

  if (!wrap) return;

  if (!cat) {
    if (heroText) heroText.textContent = "Kategori bulunamadı";
    wrap.innerHTML = "";
    return;
  }

  // hero
  if (heroImg) {
    if (cat.heroImage) heroImg.src = cat.heroImage;
    else heroImg.style.display = "none";
  }
  if (heroText) heroText.textContent = cat.heroText || " ";

  const subs = cat.subcategories || [];
  if (!subs.length) {
    // alt kategori yoksa direkt liste
    location.href = `./category.html?cat=${encodeURIComponent(catSlug)}`;
    return;
  }

  wrap.innerHTML = subs.map(s => {
    const title = (s.titleTR || s.title || "").trim();
    const subSlug = encodeURIComponent(s.slug || normKey(title));
    return `<a class="btn" href="./category.html?cat=${encodeURIComponent(catSlug)}&sub=${subSlug}">${title}</a>`;
  }).join("");
}

async function renderCategory(){
  const catSlug = getQueryParam("cat");
  const subSlug = getQueryParam("sub");

  const cat = findCat(catSlug);

  const titleEl = document.getElementById("catTitle");
  const subEl = document.getElementById("catSub");
  const itemsEl = document.getElementById("items");

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsEl) itemsEl.innerHTML = "";
    return;
  }

  // Başlık
  if (titleEl) titleEl.textContent = (cat.titleTR || cat.slug || "").replace(/-/g," ").toUpperCase();
  if (subEl) subEl.textContent = " ";

  let items = cat.items || [];

  // Sub seçildiyse
  if (subSlug && (cat.subcategories || []).length) {
    const key = normKey(subSlug);
    const sub = (cat.subcategories || []).find(s => normKey(s.slug || s.titleTR || s.title) === key);
    if (sub) {
      items = sub.items || [];
      if (titleEl) titleEl.textContent = (sub.titleTR || sub.title || "").toUpperCase();
      if (subEl) subEl.textContent = (cat.titleTR || cat.slug || "").replace(/-/g," ");
    }
  } else {
    if (titleEl && cat.titleTR) titleEl.textContent = cat.titleTR.toUpperCase();
  }

  if (!itemsEl) return;

  itemsEl.innerHTML = (items || []).map(it => {
    const name = (it.name || it["Ürün Adı"] || it["Urun Adi"] || "").trim();
    const desc = (it.descTR || it["Açıklama"] || it["Aciklama"] || it.desc || "").trim();
    const price = formatPrice(it.price || it["Fiyat"] || it.priceText);
    const img = (it.image || it["Foto"] || it.photoUrl || "").trim();

    return `
      <div class="item">
        <div class="itemMain">
          <p class="itemName">${name}</p>
          ${desc ? `<p class="itemDesc">${desc}</p>` : `<p class="itemDesc"></p>`}
        </div>
        <div class="itemRight">
          <div class="price">${price}</div>
          ${img ? `<img class="thumb" src="${img}" alt="">` : `<div class="thumb"></div>`}
        </div>
      </div>
    `;
  }).join("");
}

(async () => {
  try {
    initToTop();
    if (isSubPage) await renderSub();
    if (isCategoryPage) await renderCategory();
  } catch (e) {
    console.error(e);
  }
})();
