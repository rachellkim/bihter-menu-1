// Basit router: index mi category mi?
const isCategoryPage = location.pathname.endsWith("category.html");

// Menü verisini buradan çekiyoruz.
// Sende farklıysa (data/menu.json vb.) yolu değiştir.
async function loadMenu() {
  // Örn: ./data/menu.json
  const res = await fetch("./data/menu.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Menü verisi yüklenemedi");
  return res.json();
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

// Fiyat formatı: ₺600
function formatPrice(x) {
  if (x == null) return "";
  const s = String(x).trim();
  if (!s) return "";
  // $ gibi şeyleri temizle
  const num = s.replace(/[^\d.,]/g, "");
  return `₺${num}`;
}

function safeText(x) {
  return (x ?? "").toString().trim();
}

async function renderIndex() {
  const data = await loadMenu();
  const wrap = document.getElementById("categoryButtons");
  if (!wrap) return;

  const cats = data.categories || [];
  wrap.innerHTML = cats.map(c => {
    const title = safeText(c.titleTR || c.title || "");
    const slug = encodeURIComponent(safeText(c.slug || title));
    return `<a class="menuBtn" href="./category.html?c=${slug}">${title}</a>`;
  }).join("");
}

function findCategory(data, slugOrTitle) {
  const key = decodeURIComponent(slugOrTitle || "").toLowerCase();
  return (data.categories || []).find(c => {
    const t = safeText(c.slug || c.titleTR || c.title).toLowerCase();
    return t === key;
  }) || null;
}

async function renderCategory() {
  const data = await loadMenu();
  const slug = getQueryParam("c");
  const cat = findCategory(data, slug);

  const titleEl = document.getElementById("catTitle");
  const subEl = document.getElementById("catSub");
  const itemsEl = document.getElementById("items");

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsEl) itemsEl.innerHTML = "";
    return;
  }

  if (titleEl) titleEl.textContent = safeText(cat.titleTR || cat.title);
  if (subEl) subEl.textContent = safeText(cat.subtitleTR || " ");

  const items = cat.items || [];
  itemsEl.innerHTML = items.map(it => {
    const name = safeText(it["Ürün Adı"] || it["Urun Adi"] || it.name);
    const desc = safeText(it["Açıklama"] || it["Aciklama"] || it.descTR || it.desc);
    const price = formatPrice(it["Fiyat"] || it.price || it.priceText);
    const img = safeText(it["Foto"] || it.photoUrl || it.image || "");

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
    if (isCategoryPage) await renderCategory();
    else await renderIndex();
  } catch (e) {
    console.error(e);
  }
})();



const page = location.pathname.split("/").pop();

// sayfalar
const isIndexPage = page === "" || page === "index.html";
const isSubPage = page === "sub.html";
const isCategoryPage = page === "category.html";

// Menü verisi
async function loadMenu() {
  const res = await fetch("./data/menu.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Menü verisi yüklenemedi");
  return res.json();
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function safeText(x) {
  return (x ?? "").toString().trim();
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

function findCategory(data, slugOrTitle) {
  const key = normKey(slugOrTitle);
  return (data.categories || []).find(c => {
    const t = normKey(c.slug || c.titleTR || c.title);
    return t === key;
  }) || null;
}

// --- index (eğer dinamik yapmak istersen; şu an HTML statik, gerek yok) ---
async function renderIndex() {
  // İstersen burada butonları JSON’dan doldururuz.
}

// --- SUB PAGE (alt kategori butonları) ---
async function renderSub() {
  const data = await loadMenu();
  const catSlug = getQueryParam("cat"); // sicak-kahveler
  const cat = findCategory(data, catSlug);

  const heroImg = document.getElementById("heroImg");
  const heroText = document.getElementById("heroText");
  const wrap = document.getElementById("subButtons");

  if (!wrap) return;

  if (!cat) {
    if (heroText) heroText.textContent = "Kategori bulunamadı";
    wrap.innerHTML = "";
    return;
  }

  // üst görsel / yazı (JSON’da varsa kullan)
  const img = safeText(cat.heroImage || cat.image || "");
  if (heroImg) {
    if (img) heroImg.src = img;
    else heroImg.style.display = "none";
  }

  if (heroText) heroText.textContent = safeText(cat.heroText || " ");

  // alt kategoriler: cat.subcategories bekliyoruz
  const subs = cat.subcategories || [];
  if (!subs.length) {
    // alt kategori yoksa direkt ürün listesine yönlendir
    location.href = `./category.html?cat=${encodeURIComponent(catSlug)}`;
    return;
  }

  wrap.innerHTML = subs.map(s => {
    const title = safeText(s.titleTR || s.title || "");
    const subSlug = encodeURIComponent(s.slug || normKey(title));
    return `<a class="btn" href="./category.html?cat=${encodeURIComponent(catSlug)}&sub=${subSlug}">${title}</a>`;
  }).join("");
}

// --- CATEGORY PAGE (ürün listesi) ---
async function renderCategory() {
  const data = await loadMenu();
  const catSlug = getQueryParam("cat");
  const subSlug = getQueryParam("sub"); // optional

  const cat = findCategory(data, catSlug);

  const titleEl = document.getElementById("catTitle");
  const subEl = document.getElementById("catSub");
  const itemsEl = document.getElementById("items");

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsEl) itemsEl.innerHTML = "";
    return;
  }

  // başlık
  if (titleEl) titleEl.textContent = safeText(cat.titleTR || cat.title);
  if (subEl) subEl.textContent = safeText(cat.subtitleTR || " ");

  // eğer sub seçildiyse, items = o sub’un items’ı
  let items = cat.items || [];
  if (subSlug) {
    const key = normKey(subSlug);
    const sub = (cat.subcategories || []).find(s => normKey(s.slug || s.titleTR || s.title) === key);
    if (sub) {
      items = sub.items || [];
      if (subEl) subEl.textContent = safeText(sub.titleTR || sub.title || " ");
    }
  }

  if (!itemsEl) return;

  itemsEl.innerHTML = (items || []).map(it => {
    const name = safeText(it["Ürün Adı"] || it["Urun Adi"] || it.name);
    const desc = safeText(it["Açıklama"] || it["Aciklama"] || it.descTR || it.desc);
    const price = formatPrice(it["Fiyat"] || it.price || it.priceText);
    const img = safeText(it["Foto"] || it.photoUrl || it.image || "");

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

// yukarı çık
function initToTop(){
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

(async () => {
  try {
    initToTop();

    if (isSubPage) await renderSub();
    else if (isCategoryPage) await renderCategory();
    else if (isIndexPage) await renderIndex();
  } catch (e) {
    console.error(e);
  }
})();
