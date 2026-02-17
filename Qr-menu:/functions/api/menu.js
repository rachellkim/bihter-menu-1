export async function onRequest() {
    const res = await fetch(
      "https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME",
      {
        headers: {
          Authorization: "Bearer " + AIRTABLE_TOKEN
        }
      }
    );
  
    const json = await res.json();
  
    // Airtable → kategoriye çevir
    const grouped = {};
    json.records.forEach(r => {
      const cat = r.fields.Category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        name: r.fields.Name,
        price: r.fields.Price
      });
    });
  
    return new Response(JSON.stringify(
      Object.keys(grouped).map(k => ({
        name: k,
        items: grouped[k]
      }))
    ), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=30" // 30 sn cache
      }
    });
  }
  