const API_URL = "/api/menu";

function qp(name) {
  return new URLSearchParams(location.search).get(name);
}

function safe(x) {
  return (x ?? "").toString().trim();
}

function normSlug(x) {
  return safe(x).toLowerCase().replace(/\s+/g, "-");
}

function initToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

async function loadMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("API hata: " + res.status);
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "API ok:false");
  return data;
}

// ✅ /tr/ gibi prefix’leri de yakalayan router
function isCategory() {
  const p = location.pathname.replace(/\/$/, "");
  return p.endsWith("/category") || p.endsWith("/category.html");
}

async function renderIndex() {
  const data = await loadMenu();
  const wrap = document.getElementById("categoryButtons");
  if (!wrap) return;

  const cats = (data.categories || [])
    .slice()
    .sort((a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999));

  // ✅ önemli: /category yerine ./category
  wrap.innerHTML = cats
    .map((c) => {
      const title = safe(c.titleTR || c.titleEN || c.slug);
      const slug = encodeURIComponent(safe(c.slug || normSlug(title)));
      return `<a class="btn" href="./category?cat=${slug}">${title}</a>`;
    })
    .join("");
}

async function renderCategory() {
  const data = await loadMenu();
  const catParam = qp("cat");
  const key = normSlug(decodeURIComponent(catParam || ""));

  const cat = (data.categories || []).find(
    (c) => normSlug(c.slug || c.titleTR) === key
  );

  const titleEl = document.getElementById("catTitle");
  const itemsEl = document.getElementById("items");

  if (!cat) {
    if (titleEl) titleEl.textContent = "KATEGORİ BULUNAMADI";
    if (itemsEl) itemsEl.innerHTML = "";
    return;
  }

  if (titleEl) titleEl.textContent = safe(cat.titleTR || cat.slug).toUpperCase();

  const items = cat.items || [];
  if (!itemsEl) return;

  itemsEl.innerHTML = items
    .map((it) => {
      const name = safe(it.name);
      const desc = safe(it.desc);
      const price = safe(it.price);
      const img = safe(it.image);

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

    // ✅ kategori sayfasındaysa category render
    if (isCategory()) await renderCategory();
    else await renderIndex();
  } catch (e) {
    console.error(e);
  }
})();
