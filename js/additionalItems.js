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

export function setAdditionalItems(items) {
  const additionalItemsDiv = document.getElementById("additionalItems");

  items.forEach(function (item) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "form-check mb-3";
    itemDiv.innerHTML = `
      <input class="form-check-input" type="checkbox" value="${item.price}" id="${item.id}" name="additionalItems">
      <label class="form-check-label" for="${item.id}">${item.description} (+${item.price}$)</label>
      `;

    additionalItemsDiv.appendChild(itemDiv);
  });
}
