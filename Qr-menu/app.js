```javascript
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
const normTR = (s) => String(s ?? "").trim();

// ===== FETCH =====
async function getMenu() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Menu fetch error: " + res.status);
  const json = await res.json();
  return json.categories || [];
}

// ===== CATEGORY =====
function renderCategory(data) {
  const itemsBox = document.getElementById("items");
  const titleEl = document.getElementById("catTitle");
  if (!itemsBox) return;

  const slug = qs("cat");
  const cat = data.find(c => c.slug === slug);

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
    name.textContent = normTR(it.name);

    left.appendChild(name);

    if (it.description_tr) {
      const desc = document.createElement("p");
      desc.className = "itemDesc";
      desc.textContent = normTR(it.description_tr);
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

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await getMenu();
    renderCategory(data);
  } catch (e) {
    console.error(e);
    const box = document.getElementById("items");
    if (box) {
      box.innerHTML = "<p style='color:red;text-align:center'>Yüklenemedi</p>";
    }
  }
});
```
