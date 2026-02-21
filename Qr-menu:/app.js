// ===== CONFIG =====
const API_URL = "/api/menu";

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k);
const safe = (x) => (x ?? "").toString().trim();

// ===== LOAD MENU =====
async function loadMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("API hata verdi");
  const json = await res.json();
  if (!json.ok) throw new Error("API ok=false");
  return json.categories || [];
}

// ===== INDEX (ANA MENÜ) =====
async function renderIndex() {
  const wrap = document.getElementById("categoryButtons");
  if (!wrap) return;

  const categories = await loadMenu();

  // ⚠️ /tr/ altındasın, o yüzden RELATIVE link kullanıyoruz: "category?cat=..."
  wrap.innerHTML = categories
    .map(
      (c) => `
      <a class="btn" href="category?cat=${encodeURIComponent(c.slug)}">
        ${safe(c.titleTR)}
      </a>
    `
    )
    .join("");
}

// ===== CATEGORY (ÜRÜNLER) =====
async function renderCategory() {
  const slug = qs("cat");
  const titleEl = document.getElementById("catTitle");
  const itemsWrap = document.getElementById("items");

  if (!slug) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsWrap) itemsWrap.innerHTML = "";
    return;
  }

  const categories = await loadMenu();
  const cat = categories.find((c) => c.slug === slug);

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsWrap) itemsWrap.innerHTML = "";
    return;
  }

  if (titleEl) titleEl.textContent = safe(cat.titleTR);

  if (!itemsWrap) return;

  if (!cat.items || cat.items.length === 0) {
    itemsWrap.innerHTML = "<p style='text-align:center'>Ürün bulunamadı</p>";
    return;
  }

  itemsWrap.innerHTML = cat.items
    .map(
      (p) => `
      <div class="item">
        <div class="itemMain">
          <div class="itemName">${safe(p.name)}</div>
          ${p.desc ? `<div class="itemDesc">${safe(p.desc)}</div>` : ""}
        </div>
        <div class="itemRight">
          <div class="price">${safe(p.price)}</div>
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

// ===== ROUTER =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ✅ /tr/category veya /category (html olsa da olur)
    const p = location.pathname.toLowerCase();
    const isCategory =
      p.endsWith("/category") ||
      p.includes("/category/") ||
      p.endsWith("category.html") ||
      p.includes("category");

    if (isCategory) {
      await renderCategory();
    } else {
      await renderIndex();
    }
  } catch (e) {
    console.error("MENÜ HATASI:", e);
  }
});
