fetch("/api/menu")

  .then(res => res.json())
  .then(data => {
    const menuDiv = document.getElementById("menu");

    data.forEach(category => {
      const catDiv = document.createElement("div");
      catDiv.className = "category";
      catDiv.innerHTML = `<h2>${category.name}</h2>`;

      category.items.forEach(item => {
        const p = document.createElement("div");
        p.className = "product";
        p.innerHTML = `<span>${item.name}</span><span>${item.price}</span>`;
        catDiv.appendChild(p);
      });

      menuDiv.appendChild(catDiv);
    });
  });
