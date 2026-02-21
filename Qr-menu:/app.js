// URL tespiti: /sub veya /sub.html, /category veya /category.html
const path = location.pathname.replace(/\/$/, "");
const page = path.split("/").pop();
const isSubPage = (page === "sub" || page === "sub.html");
const isCategoryPage = (page === "category" || page === "category.html");

// ✅ Worker endpoint
const API_URL = "/api/menu";

function qp(name) {
  return new URLSearchParams(location.search).get(name);
}

function norm(x) {
  return decodeURIComponent(String(x || ""))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function formatPriceTR(x) {
  const s = String(x ?? "").trim();
  if (!s) return "";
  // worker zaten "600₺" veya "₺600" gibi string dönüyor, aynen bas
  return s;
}

function initToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

async function loadMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("API hata: " + res.status);
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "API ok:false");
  return data; // {ok:true, categories:[...]}
}

function findCat(data, catSlug) {
  const key = norm(catSlug);
  return (data.categories || []).find((c) => norm(c.slug || c.titleTR) === key) || null;
}

async function renderSub() {
  const data = await loadMenu();

  const catSlug = qp("cat");
  const cat = findCat(data, catSlug);

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
    if (cat.coverPhoto) heroImg.src = cat.coverPhoto;
    else heroImg.style.display = "none";
  }
  if (heroText) heroText.textContent = " "; // istersen cat içine tagline koyarız

  // ✅ Senin Airtable yapında subcategory yok.
  // Bu yüzden /sub sayfası sadece “kategori görseli + butonlar” gibi kullanılacaksa
  // kategorinin items’larını ürün sayfasına yönlendiriyoruz:
  // /category?cat=<slug>
  location.href = `/category?cat=${encodeURIComponent(cat.slug || catSlug)}`;
}

async function renderCategory() {
  const data = await loadMenu();

  const catSlug = qp("cat");
  const cat = findCat(data, catSlug);

  const titleEl = document.getElementById("catTitle");
  const subEl = document.getElementById("catSub");
  const itemsEl = document.getElementById("items");

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsEl) itemsEl.innerHTML = "";
    return;
  }

  if (titleEl) titleEl.textContent = String(cat.titleTR || "").toUpperCase();
  if (subEl) subEl.textContent = " ";

  const list = cat.items || [];
  if (!itemsEl) return;

  itemsEl.innerHTML = list
    .map((it) => {
      const name = String(it.name || "").trim();
      const desc = String(it.desc || "").trim();
      const price = formatPriceTR(it.price);
      const img = String(it.image || "").trim();

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
    })
    .join("");
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
