// ===== CONFIG =====
const API_URL = "/api/menu";

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k);
const safe = (x) => (x ?? "").toString().trim();

function normSlug(s) {
  return safe(s)
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

  // ✅ linkleri /category şeklinde veriyoruz
  wrap.innerHTML = categories
    .map(
      (c) => `
      <a class="btn" href="/category?cat=${encodeURIComponent(c.slug)}">
        ${safe(c.titleTR)}
      </a>
    `
    )
    .join("");
}

// ===== CATEGORY (ÜRÜNLER) =====
async function renderCategory() {
  const slugRaw = qs("cat");
  const slug = normSlug(slugRaw);

  const titleEl = document.getElementById("catTitle");
  const itemsWrap = document.getElementById("items");

  if (!titleEl || !itemsWrap) {
    console.warn("catTitle veya items elementi yok. category.html içindeki id'leri kontrol et.");
    return;
  }

  if (!slug) {
    titleEl.textContent = "Kategori seçilmedi";
    itemsWrap.innerHTML = "";
    return;
  }

  const categories = await loadMenu();
  const cat = categories.find((c) => normSlug(c.slug) === slug);

  if (!cat) {
    titleEl.textContent = "Kategori bulunamadı";
    itemsWrap.innerHTML = "";
    console.warn("Slug bulunamadı:", slugRaw, "=>", slug, "Mevcut sluglar:", categories.map(x => x.slug));
    return;
  }

  titleEl.textContent = safe(cat.titleTR);

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
          ${p.image ? `<img class="thumb" src="${p.image}" alt="">` : `<div class="thumb"></div>`}
        </div>
      </div>
    `
    )
    .join("");
}

// ===== ROUTER =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const path = location.pathname.replace(/\/+$/, ""); // sondaki / temizle

    // ✅ /category ve /category.html ikisi de kategori sayfası
    const isCategory =
      path.endsWith("/category") ||
      path.endsWith("/category.html") ||
      path.includes("/category");

    if (isCategory) await renderCategory();
    else await renderIndex();
  } catch (e) {
    console.error("MENÜ HATASI:", e);
  }
});
