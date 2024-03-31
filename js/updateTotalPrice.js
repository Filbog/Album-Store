import { saveToLocalStorage, loadFromLocalStorage } from "./localStorage.js";

export const BASE_PRICE = 49; // Hard-coded price for simplicity

export function updateTotalPrice() {
  const totalPriceElement = document.getElementById("totalPrice");

  const checkboxes = document.querySelectorAll("input[type=checkbox]");

  function calculateTotalPrice() {
    let totalPrice = BASE_PRICE; //reset total price
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        totalPrice += parseFloat(checkbox.value);
      }
    });

    totalPriceElement.textContent = totalPrice.toFixed(2) + "$";

    let albumName = document.getElementById("albumName").textContent;
    let albumData = loadFromLocalStorage(albumName);
    if (albumData) {
      albumData.totalPrice = totalPrice;
      saveToLocalStorage(albumName, albumData);
    }
    return totalPrice;
  }

  let totalPrice = calculateTotalPrice(); // Update the total price initially

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", calculateTotalPrice);
  });
  return totalPrice;
}
