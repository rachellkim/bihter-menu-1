// ===== CONFIG =====
const API_URL = "/api/menu";

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k);
const safe = (x) => (x ?? "").toString().trim().toLowerCase();

// ===== LOAD MENU =====
async function loadMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  const json = await res.json();
  return json.categories || [];
}

// ===== RENDER =====
async function render() {
  const categories = await loadMenu();

  const catParam = qs("cat");
  const btnWrap = document.getElementById("categoryButtons");
  const itemsWrap = document.getElementById("items");

  // 👉 ANA MENÜ (kategori listesi)
  if (btnWrap && !catParam) {
    btnWrap.innerHTML = categories
      .map(
        (c) => `
        <a class="btn" href="/?cat=${encodeURIComponent(c.titleTR)}">
          ${c.titleTR}
        </a>
      `
      )
      .join("");
    return;
  }

  // 👉 KATEGORİ + ÜRÜNLER
  if (!itemsWrap) return;

  const cat = categories.find(
    (c) => safe(c.titleTR) === safe(catParam)
  );

  if (!cat || !cat.items || cat.items.length === 0) {
    itemsWrap.innerHTML =
      "<p style='text-align:center'>Ürün bulunamadı</p>";
    return;
  }

  itemsWrap.innerHTML = cat.items
    .map(
      (p) => `
      <div class="item">
        <div class="itemMain">
          <div class="itemName">${p.name}</div>
          ${p.desc ? `<div class="itemDesc">${p.desc}</div>` : ""}
        </div>
        <div class="itemRight">
          <div class="price">${p.price}</div>
          ${
            p.image
              ? `<img class="thumb" src="${p.image}">`
              : `<div class="thumb"></div>`
          }
        </div>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", render);
