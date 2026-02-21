const isCategoryPage = location.pathname.endsWith("category.html");

// ===== MENU LOAD =====
async function loadMenu() {
  const res = await fetch("/api/menu", { cache: "no-store" });
  if (!res.ok) throw new Error("Menü verisi yüklenemedi");
  return res.json();
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function safeText(x) {
  return (x ?? "").toString().trim();
}

// ===== INDEX =====
async function renderIndex() {
  const data = await loadMenu();
  const wrap = document.getElementById("categoryButtons");
  if (!wrap) return;

  wrap.innerHTML = (data.categories || [])
    .map((c) => {
      const title = safeText(c.titleTR || c.title);
      const slug = encodeURIComponent(c.slug);
      return `<a class="menuBtn" href="./category.html?c=${slug}">${title}</a>`;
    })
    .join("");
}

// ===== CATEGORY =====
async function renderCategory() {
  const data = await loadMenu();
  const slug = getQueryParam("c");

  const cat = (data.categories || []).find(
    (c) => c.slug === slug
  );

  if (!cat) {
    document.getElementById("catTitle").textContent = "Kategori bulunamadı";
    return;
  }

  document.getElementById("catTitle").textContent = cat.titleTR;

  const itemsEl = document.getElementById("items");
  itemsEl.innerHTML = (cat.items || [])
    .map(
      (p) => `
      <div class="item">
        <div class="itemMain">
          <div class="itemName">${safeText(p.name)}</div>
          ${p.desc ? `<div class="itemDesc">${safeText(p.desc)}</div>` : ""}
        </div>
        <div class="itemRight">
          <div class="price">${safeText(p.price)}</div>
          ${
            p.image
              ? `<img class="thumb" src="${p.image}" />`
              : ""
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
    if (isCategoryPage) {
      await renderCategory();
    } else {
      await renderIndex();
    }
  } catch (err) {
    console.error("MENÜ HATASI:", err);
  }
});
