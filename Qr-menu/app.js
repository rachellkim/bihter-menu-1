// ===== CONFIG =====
const API_URL = "https://menu-worker.sudeonder.workers.dev/menu";

// Ana sayfada görünecek ana kategori slug'ları (Airtable slug(text))
const MAIN_SLUGS = [
  "tatlilar",
  "soguk-kahveler",
  "sicak-icecekler",
  "sicak-kahveler",
  "soguk-icecekler",
  "atistirmaliklar",
  "sicak-matcha",
];

/**
 * ANA -> ALT kategori eşlemesi (Airtable slug'larıyla)
 */
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
const normTR = (s) => String(s ?? "").trim();
const getSlug = (cat) => cat?.slug || cat?.slugText || cat?.["slug(text)"] || "";
const getTitle = (cat) => cat?.titleTR || cat?.title || getSlug(cat) || "";

// Card & body arkaplan
function setBgsBySlug(slug) {
  const BG_MAP = {
    "soguk-kahveler": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
    "sicak-kahveler": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
    "sicak-icecekler": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
    "soguk-icecekler": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
    "tatlilar": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
    "atistirmaliklar": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
    "sicak-matcha": "https://static.wixstatic.com/media/b9ef37_d2f5aa4eb3c54500a2af1030b1a315b6~mv2.jpg",
  };
  const url = BG_MAP[slug] || BG_MAP["tatlilar"];
  document.documentElement.style.setProperty("--card-bg-img", `url("${url}")`);
  document.documentElement.style.setProperty("--sub-bg", `url("${url}")`);
}

function formatPrice(p) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  if (/^\d+([.,]\d+)?$/.test(s)) return s.replace(",", ".") + "₺";
  return s;
}

function getProductImage(it) {
  if (!it?.image) return "";
  if (Array.isArray(it.image)) return it.image[0]?.url || "";
  return it.image?.url || it.image || "";
}

// ===== FETCH MENU =====
async function getMenu() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Menu fetch error: " + res.status);
  const json = await res.json();
  return json.categories || [];
}

// ===== RENDER: MAIN INDEX =====
function renderIndex(data) {
  const box = document.getElementById("categoryButtons");
  if (!box) return;

  const catsBySlug = new Map(data.map((c) => [getSlug(c), c]));

  box.innerHTML = "";
  for (const slug of MAIN_SLUGS) {
    const cat = catsBySlug.get(slug);
    if (!cat) continue;

    const title = getTitle(cat);
    const hasSubs = Array.isArray(SUB_MAP[slug]) && SUB_MAP[slug].length > 0;

    const href = hasSubs
      ? `/sub.html?main=${encodeURIComponent(slug)}`
      : `/category/?cat=${encodeURIComponent(slug)}`;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.textContent = title;
    box.appendChild(a);
  }
}

// ===== RENDER: SUB PAGE =====
function renderSub(data) {
  const box = document.getElementById("subButtons");
  const titleEl = document.getElementById("subTitle");
  if (!box) return;

  const mainSlug = qs("main");
  const mainCat = data.find((c) => getSlug(c) === mainSlug);

  if (!mainCat) {
    box.innerHTML = `<p style="text-align:center; opacity:.7;">Kategori bulunamadı.</p>`;
    return;
  }

  if (titleEl) titleEl.textContent = getTitle(mainCat);
  setBgsBySlug(mainSlug);

  const subs = SUB_MAP[mainSlug] || [];
  box.innerHTML = "";

  if (!subs.length) {
    location.href = `/category/?cat=${encodeURIComponent(mainSlug)}`;
    return;
  }

  for (const subSlug of subs) {
    const cat = data.find((c) => getSlug(c) === subSlug);
    const title = cat ? getTitle(cat) : subSlug;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = `/category/?cat=${encodeURIComponent(subSlug)}`;
    a.textContent = title;
    box.appendChild(a);
  }
}

// ===== RENDER: CATEGORY PAGE =====
function renderCategory(data) {
  const itemsBox = document.getElementById("items");
  const titleEl = document.getElementById("catTitle");
  if (!itemsBox) return;

  const slug = qs("cat");
  const cat = data.find((c) => getSlug(c) === slug);

  if (!cat) {
    itemsBox.innerHTML = `<p style="text-align:center; opacity:.7;">Kategori bulunamadı.</p>`;
    return;
  }

  if (titleEl) titleEl.textContent = normTR(getTitle(cat));
  setBgsBySlug(slug);

  const items = [...(cat.items || [])].sort((a, b) => (a.Sira ?? 999999) - (b.Sira ?? 999999));
  itemsBox.innerHTML = "";

  for (const it of items) {
    const name = normTR(it.name);
    const desc = normTR(it.desc);
    const price = formatPrice(it.price);
    const imgUrl = getProductImage(it);

    const card = document.createElement("article");
    card.className = "item";

    const left = document.createElement("div");
    left.className = "itemMain";
    left.innerHTML = `<h3 class="itemName">${name}</h3>${desc ? `<p class="itemDesc">${desc}</p>` : ""}`;

    const right = document.createElement("div");
    right.className = "itemRight";

    const p = document.createElement("div");
    p.className = "price";
    p.textContent = price;
    right.appendChild(p);

    if (imgUrl) {
      const img = document.createElement("img");
      img.className = "thumb";
      img.alt = name;
      img.loading = "lazy";
      img.src = imgUrl;
      right.appendChild(img);
    }

    card.appendChild(left);
    card.appendChild(right);
    itemsBox.appendChild(card);
  }
}

// ===== TO TOP =====
function setupToTop() {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 400 ? "block" : "none";
  }, { passive: true });

  btn.style.display = "none";
}

// ===== INIT =====
(async function init() {
  try {
    setupToTop();
    const data = await getMenu();
    renderIndex(data);
    renderSub(data);
    renderCategory(data);
  } catch (e) {
    console.error(e);
    const box = document.getElementById("categoryButtons") || document.getElementById("subButtons") || document.getElementById("items");
    if (box) box.innerHTML = `<p style="text-align:center; color:#a00;">Yüklenemedi. (API / veri hatası)</p>`;
  }
})();
