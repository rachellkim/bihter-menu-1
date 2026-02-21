const API_URL = "/api/menu";
const qs = (k) => new URLSearchParams(location.search).get(k);

// --------------------
// ANA SAYFA (6 KATEGORİ)
// --------------------
async function renderMainCategories() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const allowed = [
    "soguk-kahveler",
    "sicak-icecekler",
    "sicak-kahveler",
    "soguk-icecekler",
    "tatlilar",
    "kahvaltiliklar",
  ];

  const list = document.getElementById("categoryList");
  if (!list) return;

  data.categories
    .filter(c => allowed.includes(c.slug))
    .forEach(cat => {
      const btn = document.createElement("a");
      btn.className = "category-btn";
      btn.href = `/sub.html?main=${cat.slug}`;
      btn.textContent = cat.titleTR;
      list.appendChild(btn);
    });
}

// --------------------
// SUB SAYFASI (ALT KATEGORİLER)
// --------------------
async function renderSubCategories() {
  const mainSlug = qs("main");
  if (!mainSlug) return;

  const res = await fetch(API_URL);
  const data = await res.json();

  const list = document.getElementById("subcategoryList");
  if (!list) return;

  data.categories
    .filter(c => c.parentSlug === mainSlug)
    .forEach(sub => {
      const btn = document.createElement("a");
      btn.className = "category-btn";
      btn.href = `/category/?cat=${sub.slug}`;
      btn.textContent = sub.titleTR;
      list.appendChild(btn);
    });
}

// --------------------
// CATEGORY SAYFASI (ÜRÜNLER)
// --------------------
async function renderProducts() {
  const catSlug = qs("cat");
  if (!catSlug) return;

  const res = await fetch(API_URL);
  const data = await res.json();

  const category = data.categories.find(c => c.slug === catSlug);
  if (!category) return;

  document.getElementById("categoryTitle").textContent = category.titleTR;

  const list = document.getElementById("productList");
  category.items.forEach(item => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <div class="name">${item["Ürün Adı"]}</div>
      <div class="price">${item["Fiyat"]} ₺</div>
    `;
    list.appendChild(div);
  });
}

// --------------------
document.addEventListener("DOMContentLoaded", () => {
  renderMainCategories();
  renderSubCategories();
  renderProducts();
});
