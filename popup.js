document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchButton').addEventListener('click', function () {
      const searchTerm = document.getElementById('searchInput').value;
      if (searchTerm) {
        fetchData(searchTerm);
      }
    });
  });

  function fetchData(searchTerm) {
    const QueryURL = `https://2fwotdvm2o-dsn.algolia.net/1/indexes/product_variants_v2?analyticsTags=["platform:ios","channel:alias"]&distinct=1&facetingAfterDistinct=1&facets=["product_category"]&filters=(product_category:shoes)&page=0&query=${searchTerm}`
  
    fetch(QueryURL, {
      method: "GET",
      headers: {
        'X-Algolia-API-Key': '838ecd564b6aedc176ff73b67087ff43', 'X-Algolia-Application-Id': '2FWOTDVM2O'
      },
    })
    .then(response => response.json())
    .then(data => {
      displayData(data);
    })
    .catch(error => {
      document.getElementById('data').innerText = 'Error, Please try again!';
    });
  }

  function fetchSizePrice(searchSlug) {
    const QueryURLSP = "https://sell-api.goat.com/api/v1/analytics/list-variant-availabilities"
    const queryBody = {"variant": {"id": searchSlug,"packaging_condition":"PACKAGING_CONDITION_GOOD_CONDITION","product_condition": "PRODUCT_CONDITION_NEW","consigned":'false'}}
    // const queryBody = {"variant": {"id": searchSlug,"packaging_condition":"PACKAGING_CONDITION_GOOD_CONDITION","product_condition": "PRODUCT_CONDITION_NEW","consigned":'false',"regionId":"69"}}
    // Change the regionId if you want prices from other countries, I got the regionId from making a request and got it via Charles

    fetch(QueryURLSP, {
      method: "POST",
      body: JSON.stringify(queryBody),
    })
    .then(response => response.json())
    .then(data => {
      displayData2(data);
    })
    .catch(error => {
      document.getElementById('data').innerText = 'Fetch Size Error';
    });
  }

function displayData(data) {
    const sku = data?.hits[0].sku;
    const name = data?.hits[0].name;
    const image = data?.hits[0].main_glow_picture_url;
    const slug = data?.hits[0].slug;
    if (slug){
      fetchSizePrice(slug);
    }
  
    let productDetailsHTML = `
      <div id="productDetails" style="text-align: center; margin-bottom: 20px;">
        <img src="${image}" alt="${name}" style="max-width: 100%; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 10px;" />
        <div><strong>Name:</strong> ${name || 'N/A'}</div>
        <div><strong>SKU:</strong> ${sku || 'N/A'}</div>
      </div>
    `;
    document.getElementById('data').innerHTML = productDetailsHTML;
  }

function displayData2(data2) {

  let tableHTML = '<table><tr><th>Size</th><th>Sold</th><th>Ask</th><th>Bid</th></tr>';

  const SPAvail = data2?.availability;
  SPAvail.forEach(sizer => {
    const aliasSize = String(sizer.variant.size);
    try{
      if (sizer?.variant?.product_condition === "PRODUCT_CONDITION_NEW" && sizer?.variant?.packaging_condition === "PACKAGING_CONDITION_GOOD_CONDITION") {
        let LowestOffer = sizer?.high_demand_price_cents || sizer?.lowest_price_cents || "000";
        let HighestBid = sizer?.highest_offer_cents || "000";
        let LastSold = (sizer?.last_sold_price_cents || "000");
        console.log(aliasSize + " | " + LowestOffer + " | " + HighestBid + " | " + LastSold)
        if (LowestOffer != "000" || HighestBid != "000" || LastSold != "000"){
          tableHTML += `<tr>
                <td>${aliasSize}</td>
                <td>$${LastSold.slice(0, -2)}</td>
                <td>$${LowestOffer.slice(0, -2)}</td>
                <td>$${HighestBid.slice(0, -2)}</td>
              </tr>`;
            }
        }
        }
    catch(e){}
});
  tableHTML += '</table>';
  document.getElementById('data').innerHTML += tableHTML;
}