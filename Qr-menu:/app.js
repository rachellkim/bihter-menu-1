// URL tespiti: /sub veya /sub.html, /category veya /category.html
const path = location.pathname.replace(/\/$/, "");
const page = path.split("/").pop();
const isSubPage = (page === "sub" || page === "sub.html");
const isCategoryPage = (page === "category" || page === "category.html");

// ✅ BURAYI DOLDUR
// 1) Eğer Pages ile aynı domainde route verdiysen çoğu zaman "/api/menu" yeter.
// 2) Değilse full URL yaz.
const API_URL = "/api/menu"; // örn: "https://xxx.workers.dev/api/menu"

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function normKey(x){
  return decodeURIComponent(String(x||""))
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function formatPrice(x) {
  if (x == null) return "";
  const s = String(x).trim();
  if (!s) return "";
  const num = s.replace(/[^\d.,]/g, "");
  return `₺${num}`;
}

// yukarı çık
function initToTop(){
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ✅ Worker’dan menüyü al
async function getMenuFromWorker() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Menü çekilemedi: " + res.status);
  return res.json();
}

/**
 * Worker’dan gelen veriyi normalize ediyoruz.
 * Beklediğim en rahat format:
 * { items: [{category, sub, name, desc, price, image, order}, ...] }
 *
 * Eğer senin Worker farklı isimlerle dönüyorsa: burada map’leriz.
 */
function normalizeWorkerData(raw) {
  // Çoğu kurulumda raw.items veya raw.data.items gibi gelir
  const items = raw?.items || raw?.data?.items || raw?.records || [];

  // items zaten hazırsa direkt döneriz
  return items.map(x => ({
    category: (x.category || x.Category || x.cat || x.catSlug || "").toString(),
    sub: (x.sub || x.Sub || x.subcategory || x.subSlug || "").toString(),
    name: (x.name || x["Ürün Adı"] || x["Urun Adi"] || x.Name || "").toString(),
    desc: (x.desc || x.descTR || x["Açıklama"] || x["Aciklama"] || x.Desc || "").toString(),
    price: (x.price || x.Price || x.priceText || x["Fiyat"] || "").toString(),
    image: (x.image || x.photoUrl || x.Photo || x["Foto"] || "").toString(),
    order: Number(x.order || x.Order || 9999),
  }));
}

/**
 * items -> categories tree:
 * [
 *  {slug, titleTR, heroImage, heroText, subcategories:[{slug,titleTR,items:[]}] , items:[]}
 * ]
 *
 * Burada titleTR yoksa slug’dan üretiriz.
 * heroImage/heroText istersen Airtable’dan da taşıyabiliriz (şimdilik opsiyon).
 */
function buildTree(items) {
  const catMap = new Map();

  for (const it of items) {
    const catSlug = normKey(it.category);
    if (!catSlug) continue;

    if (!catMap.has(catSlug)) {
      catMap.set(catSlug, {
        slug: catSlug,
        titleTR: humanize(catSlug),
        heroImage: "",     // istersen Airtable’dan gelir
        heroText: "",      // istersen Airtable’dan gelir
        subcategories: [],
        items: [],
      });
    }

    const cat = catMap.get(catSlug);

    const subSlug = normKey(it.sub);
    if (subSlug) {
      let sub = cat.subcategories.find(s => s.slug === subSlug);
      if (!sub) {
        sub = { slug: subSlug, titleTR: humanize(subSlug), items: [] };
        cat.subcategories.push(sub);
      }
      sub.items.push(it);
    } else {
      cat.items.push(it);
    }
  }

  // sıralama
  for (const cat of catMap.values()) {
    cat.items.sort((a,b)=> (a.order??9999) - (b.order??9999));
    for (const sub of cat.subcategories) {
      sub.items.sort((a,b)=> (a.order??9999) - (b.order??9999));
    }
  }

  return Array.from(catMap.values());
}

function humanize(slug){
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function findCat(tree, slug){
  const key = normKey(slug);
  return tree.find(c => c.slug === key) || null;
}

async function renderSub(){
  const raw = await getMenuFromWorker();
  const items = normalizeWorkerData(raw);
  const tree = buildTree(items);

  const catSlug = getQueryParam("cat");
  const cat = findCat(tree, catSlug);

  const heroImg = document.getElementById("heroImg");
  const heroText = document.getElementById("heroText");
  const wrap = document.getElementById("subButtons");

  if (!wrap) return;

  if (!cat) {
    if (heroText) heroText.textContent = "Kategori bulunamadı";
    wrap.innerHTML = "";
    return;
  }

  // hero (istersen Airtable’dan taşıyacağız, şimdilik yoksa gizler)
  if (heroImg) {
    if (cat.heroImage) heroImg.src = cat.heroImage;
    else heroImg.style.display = "none";
  }
  if (heroText) heroText.textContent = cat.heroText || " ";

  // alt kategori varsa butonları bas
  if ((cat.subcategories || []).length) {
    wrap.innerHTML = cat.subcategories.map(s => {
      return `<a class="btn" href="/category?cat=${encodeURIComponent(cat.slug)}&sub=${encodeURIComponent(s.slug)}">${s.titleTR}</a>`;
    }).join("");
    return;
  }

  // alt kategori yoksa direkt ürün listesine
  location.href = `/category?cat=${encodeURIComponent(cat.slug)}`;
}

async function renderCategory(){
  const raw = await getMenuFromWorker();
  const items = normalizeWorkerData(raw);
  const tree = buildTree(items);

  const catSlug = getQueryParam("cat");
  const subSlug = getQueryParam("sub");

  const cat = findCat(tree, catSlug);

  const titleEl = document.getElementById("catTitle");
  const subEl = document.getElementById("catSub");
  const itemsEl = document.getElementById("items");

  if (!cat) {
    if (titleEl) titleEl.textContent = "Kategori bulunamadı";
    if (itemsEl) itemsEl.innerHTML = "";
    return;
  }

  let title = cat.titleTR;
  let subtitle = " ";

  let list = cat.items || [];

  if (subSlug) {
    const key = normKey(subSlug);
    const sub = (cat.subcategories || []).find(s => s.slug === key);
    if (sub) {
      title = sub.titleTR;
      subtitle = cat.titleTR.toLowerCase();
      list = sub.items || [];
    }
  }

  if (titleEl) titleEl.textContent = title.toUpperCase();
  if (subEl) subEl.textContent = subtitle;

  if (!itemsEl) return;

  itemsEl.innerHTML = list.map(it => {
    const name = (it.name || "").trim();
    const desc = (it.desc || "").trim();
    const price = formatPrice(it.price);
    const img = (it.image || "").trim();

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
  }).join("");
}

(async () => {
  try {
    initToTop();
    if (isSubPage) await renderSub();
    if (isCategoryPage) await renderCategory();
  } catch (e) {
    console.error(e);
  }
})();
