import { saveToLocalStorage, loadFromLocalStorage } from "./localStorage.js";

export const BASE_PRICE = 49; // Base album price for simplicity

// Update price when buying a particular album
export function updateTotalPrice() {
  // Get the total price element
  const totalPriceElement = document.getElementById("totalPrice");

  // Get all the checkboxes
  const checkboxes = document.querySelectorAll("input[type=checkbox]");

  // Function to update the total price
  function calculateTotalPrice() {
    let totalPrice = BASE_PRICE; //reset the total price
    // Add the price of each checked checkbox to the total price
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        totalPrice += parseFloat(checkbox.value);
      }
    });

    // Update the total price element
    totalPriceElement.textContent = totalPrice.toFixed(2) + "$";

    // Get album name from the form
    let albumName = document.getElementById("albumName").textContent;
    // Load album data from localStorage
    let albumData = loadFromLocalStorage(albumName);
    // If album data exists, update the total price and save it back to localStorage
    if (albumData) {
      albumData.totalPrice = totalPrice;
      saveToLocalStorage(albumName, albumData);
    }
    return totalPrice;
  }

  // Update the total price initially
  let totalPrice = calculateTotalPrice();

  // Add event listeners to the checkboxes
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", calculateTotalPrice);
  });
  return totalPrice;
}
