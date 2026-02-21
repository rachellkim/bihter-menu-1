// ===== CONFIG =====
const API_URL = "/api/menu";
// Cloudflare route sayesinde bu zaten worker’a gidiyor

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k);
const safe = (x) => (x ?? "").toString().trim();

function pathClean() {
  // sondaki slashleri temizle ( /category/ -> /category )
  return location.pathname.replace(/\/+$/, "");
}

// ===== LOAD MENU =====
async function loadMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`API hata verdi: ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error("API ok=false");
  return json.categories || [];
}

// ===== INDEX (ANA MENÜ) =====
async function renderIndex() {
  const wrap = document.getElementById("categoryButtons");
  if (!wrap) return;

  const categories = await loadMenu();

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
  const slug = qs("cat");
  const titleEl = document.getElementById("catTitle");
  const itemsWrap = document.getElementById("items");

  if (!slug) {
    if (titleEl) titleEl.textContent = "Kategori seçilmedi";
    return;
  }

  const categories = await loadMenu();
  const cat = categories.find((c) => (c.slug || "") === slug);

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsWrap) itemsWrap.innerHTML = "";
    return;
  }

  if (titleEl) titleEl.textContent = safe(cat.titleTR);

  if (!itemsWrap) return;

  const items = Array.isArray(cat.items) ? cat.items : [];

  itemsWrap.innerHTML = items
    .map((p) => {
      const name = safe(p.name);
      const desc = safe(p.desc);
      const price = safe(p.price);
      const img = safe(p.image);

      return `
        <div class="item">
          <div class="itemMain">
            <div class="itemName">${name}</div>
            ${desc ? `<div class="itemDesc">${desc}</div>` : ""}
          </div>
          <div class="itemRight">
            <div class="price">${price}</div>
            ${
              img
                ? `<img class="thumb" src="${img}" alt="">`
                : `<div class="thumb"></div>`
            }
          </div>
        </div>
      `;
    })
    .join("");
}

// ===== ROUTER =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const p = pathClean();

    const isCategoryPage =
      p.endsWith("/category") || p.endsWith("category.html");

    if (isCategoryPage) {
      await renderCategory();
    } else {
      await renderIndex();
    }
  } catch (e) {
    console.error("MENÜ HATASI:", e);

    // Ekranda da gösterelim boş kalmasın
    const wrap =
      document.getElementById("categoryButtons") ||
      document.getElementById("items");

    if (wrap) {
      wrap.innerHTML = `
        <div style="padding:12px; font-size:14px;">
          Menü şu an yüklenemedi. Lütfen tekrar deneyin.
        </div>
      `;
    }
  }
});
