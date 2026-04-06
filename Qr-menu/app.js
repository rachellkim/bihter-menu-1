// ===== CONFIG =====
const API_URL = "https://raw.githubusercontent.com/rachellkim/menu-json/main/menu.json";

const MAIN_SLUGS = [
  "tatlilar",
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "atistirmaliklar",
  "sicak-matcha",
];

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

// ===== INDEX =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  box.innerHTML = "";

  data.forEach(cat => {
    if (!MAIN_SLUGS.includes(cat.slug)) return;

    const hasSubs = SUB_MAP[cat.slug]?.length > 0;

    const href = hasSubs
      ? `/sub.html?main=${cat.slug}`
      : `/category/?cat=${cat.slug}`;

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

    left.innerHTML = `
      <h3 class="itemName">${it.name}</h3>
      ${it.description_tr ? `<p class="itemDesc">${it.description_tr}</p>` : ""}
    `;

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

    if (document.getElementById("categoryButtons")) {
      renderIndex(data);
    }

    if (document.getElementById("subButtons")) {
      renderSub(data);
    }

    if (document.getElementById("items")) {
      renderCategory(data);
    }

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
