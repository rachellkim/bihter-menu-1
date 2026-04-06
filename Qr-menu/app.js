// ===== CONFIG =====
const API_URL = "https://raw.githubusercontent.com/rachellkim/menu-json/main/menu.json";

const SUB_MAP = {
  "atistirmaliklar": [],
  "sicak-kahveler": ["espresso-bazli", "aromali-ozel-kahveler", "filtreturk", "sicak-matcha"],
  "soguk-kahveler": ["sogukbazli", "soguk-matchalar", "frappeler"],
  "sicak-icecekler": [],
  "soguk-icecekler": [],
  "tatlilar": [],
};

// ===== HELPERS =====
const qs = (k) => new URLSearchParams(location.search).get(k) || "";
const norm = (s) => String(s ?? "").trim().toLowerCase();

// ===== FETCH =====
async function getMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Menu fetch error: " + res.status);
  const json = await res.json();
  return json.categories || [];
}

// ===== INDEX (OTOMATİK) =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  box.innerHTML = "";

  data.forEach(cat => {
    const slug = cat.slug;
    const hasSubs = SUB_MAP[slug]?.length > 0;

    const href = hasSubs
      ? `/sub.html?main=${slug}`
      : `/category/?cat=${slug}`;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.textContent = cat.name;

    box.appendChild(a);
  });
}

// ===== SUB PAGE =====
function renderSub(data) {
  const box = document.getElementById("subButtons");
  const titleEl = document.getElementById("subTitle");
  if (!box) return;

  const mainSlug = qs("main");
  const mainCat = data.find(c => norm(c.slug) === norm(mainSlug));

  if (!mainCat) return;

  if (titleEl) titleEl.textContent = mainCat.name;

  const subs = SUB_MAP[mainSlug] || [];
  box.innerHTML = "";

  if (!subs.length) {
    location.href = `/category/?cat=${mainSlug}`;
    return;
  }

  subs.forEach(subSlug => {
    const cat = data.find(c => norm(c.slug) === norm(subSlug));

    const a = document.createElement("a");
    a.className = "btn";
    a.href = `/category/?cat=${subSlug}`;
    a.textContent = cat ? cat.name : subSlug;

    box.appendChild(a);
  });
}

// ===== CATEGORY =====
function renderCategory(data) {
  const itemsBox = document.getElementById("items");
  const titleEl = document.getElementById("catTitle");
  if (!itemsBox) return;

  const slug = qs("cat");
  const cat = data.find(c => norm(c.slug) === norm(slug));

  if (!cat) {
    itemsBox.innerHTML = "<p>Kategori bulunamadı</p>";
    return;
  }

  if (titleEl) titleEl.textContent = cat.name;

  itemsBox.innerHTML = "";

  (cat.products || []).forEach(it => {
    const card = document.createElement("article");
    card.className = "item";

    const left = document.createElement("div");
    left.className = "itemMain";

    const name = document.createElement("h3");
    name.className = "itemName";
    name.textContent = it.name;
    left.appendChild(name);

    if (it.description_tr) {
      const desc = document.createElement("p");
      desc.className = "itemDesc";
      desc.textContent = it.description_tr;
      left.appendChild(desc);
    }

    const right = document.createElement("div");
    right.className = "itemRight";

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = it.price_display || "";
    right.appendChild(price);

    if (it.image) {
      const img = document.createElement("img");
      img.className = "thumb";
      img.src = it.image;
      img.alt = it.name;
      img.loading = "lazy";
      right.appendChild(img);
    }

    card.appendChild(left);
    card.appendChild(right);
    itemsBox.appendChild(card);
  });
}

// ===== TO TOP =====
function setupToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 400 ? "block" : "none";
  });

  btn.style.display = "none";
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    setupToTop();

    const data = await getMenu();

    renderIndex(data);
    renderSub(data);
    renderCategory(data);

  } catch (e) {
    console.error(e);

    const box =
      document.getElementById("categoryButtons") ||
      document.getElementById("subButtons") ||
      document.getElementById("items");

    if (box) {
      box.innerHTML = "<p style='color:red;text-align:center'>Yüklenemedi</p>";
    }
  }
});
