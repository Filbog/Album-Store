export const additionalItems = [
  {
    id: "signedCopy",
    price: 50,
    description: "Signed album copy",
  },
  {
    id: "tshirt",
    price: 45,
    description: "Official T-shirt",
  },
  {
    id: "lyricBook",
    price: 25,
    description: "Lyric book",
  },
  {
    id: "present",
    price: 15,
    description: "Wrap as present",
  },
];

// Set up additional items
export function setAdditionalItems(items) {
  // Get the additional items div
  const additionalItemsDiv = document.getElementById("additionalItems");

  // Loop through the items
  items.forEach(function (item) {
    // Create a div for the item
    const itemDiv = document.createElement("div");
    itemDiv.className = "form-check mb-3";
    itemDiv.innerHTML = `
      <input class="form-check-input" type="checkbox" value="${item.price}" id="${item.id}" name="additionalItems">
      <label class="form-check-label" for="${item.id}">${item.description} (+${item.price}$)</label>
      `;

    // Add the item div to the additional items div
    additionalItemsDiv.appendChild(itemDiv);
  });
}
