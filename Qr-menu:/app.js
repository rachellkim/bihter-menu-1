const API = "https://spring-flower-9430menu-api.zynpsude-onder.workers.dev/";

async function getMenu() {
  const r = await fetch(API);
  return r.json();
}

function qs(k) {
  return new URLSearchParams(location.search).get(k);
}

function card(item) {
  return `
    <div class="card">
      <div class="left">
        <div class="name">${item.name || ""}</div>
        <div class="desc">${item.descTR || ""}</div>
      </div>
      <div class="right">
        <div class="price">${item.priceText || ""}</div>
        ${item.photoUrl ? `<img src="${item.photoUrl}">` : ""}
      </div>
    </div>
  `;
}

async function home() {
  const wrap = document.getElementById("cats");
  if (!wrap) return;
  const data = await getMenu();
  wrap.innerHTML = data.categories
    .map(c => `<a href="category.html?slug=${c.slug}">${c.titleTR}</a>`)
    .join("");
}

async function category() {
  const slug = qs("slug");
  const title = document.getElementById("title");
  const list = document.getElementById("list");
  if (!slug || !list) return;

  const data = await getMenu();
  const cat = data.categories.find(c => c.slug === slug);
  if (!cat) return;

  title.innerText = cat.titleTR;
  list.innerHTML = cat.items.map(card).join("");
}

home();
category();
