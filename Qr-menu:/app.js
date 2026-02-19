(function () {
  // Eğer category.html değilsek hiçbir şey yapma
  const list = document.getElementById("product-list");
  if (!list) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  const titleEl = document.getElementById("category-title");
  const titles = {
    "sicak-kahveler": "Sıcak Kahveler",
    "soguk-kahveler": "Soğuk Kahveler",
    "tatlilar": "Tatlılar",
    "kahvaltiliklar": "Kahvaltılıklar"
  };

  titleEl.textContent = titles[category] || "Kategori";

  fetch("data/products.json", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      const products = data[category] || [];

      if (products.length === 0) {
        list.innerHTML = `<p style="opacity:.7">Bu kategoride ürün yok.</p>`;
        return;
      }

      list.innerHTML = products
        .map(
          (p) => `
          <div class="product">
            <div class="product-left">
              <div class="product-name">${p.name || ""}</div>
              <div class="product-desc">${p.desc || ""}</div>
            </div>

            <div class="product-right">
              <div class="product-price">${p.price || ""}</div>
              ${p.image ? `<img class="product-img" src="${p.image}" alt="${p.name || ""}">` : ""}
            </div>
          </div>
        `
        )
        .join("");
    })
    .catch((err) => {
      console.error(err);
      list.innerHTML = `<p style="color:#b00">Ürünler yüklenemedi.</p>`;
    });
})();
