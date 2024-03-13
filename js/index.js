import { search, setShipmentDateAttributes } from "./utils.js";
import { fetchAlbums } from "./api.js";
import { saveToLocalStorage, loadFromLocalStorage } from "./localStorage.js";
import { additionalItems, setAdditionalItems } from "./additionalItems.js";

const BASE_PRICE = 49; // Base album price for simplicity
let totalPrice; // Total price of the purchase

// let albums;

// Function to handle form changes
function handleFormChange() {
  // Get the form
  const form = document.getElementById("purchaseForm");

  // Get the form data
  const formData = new FormData(form);

  // Create an object to hold the form data
  const data = {};
  formData.forEach(function (value, key) {
    // Handle additional items separately
    if (key === "additionalItems") {
      // If 'additionalItems' is not yet in the data object, add it as an array
      if (!data[key]) {
        data[key] = [];
      }
      // Get the item name from the checkbox
      let itemName = form.querySelector(
        `input[name="${key}"][value="${value}"]`
      ).id;
      // Add the value to the 'additionalItems' array
      data[key].push(itemName);
    } else {
      // For other keys, just assign the value
      data[key] = value;
    }
  });
  data["totalPrice"] = totalPrice; //add total price

  // get album name and add it to the data object
  let albumName = document.getElementById("albumName").textContent;
  data["albumName"] = albumName;

  // Save the form data to localStorage
  saveToLocalStorage(albumName, data);
}

// Display albums on the page
export function displayAlbums(albums) {
  console.log("displaying albums...");
  const displayAlbums = document.getElementById("display-albums");
  displayAlbums.innerHTML = ""; // clear the div from previous searches etc
  albums.forEach((album) => {
    //display albums in a responsive grid
    const albumDiv = document.createElement("div");
    albumDiv.className =
      "col-12 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center";

    albumDiv.innerHTML = `
      <div class="card m-2" style="width: 18rem;" data-bs-toggle="modal" data-bs-target="#purchaseModal" type="button" data-album="${album.name}">
        <img src="${album.image[2]["#text"]}" class="card-img-top album-image" alt="${album.name}">
        <div class="card-body">
          <h5 class="card-title">${album.name}</h5>
        </div>
        <div class="card-img-overlay d-flex align-items-center justify-content-center">
        <button class="btn btn-primary buy-button px-3 py-2" data-bs-toggle="modal" data-bs-target="#purchaseModal" type="button" data-album="${album.name}">Buy now</button>
      </div>
      </div>
    `;
    displayAlbums.appendChild(albumDiv); // append albumDiv to the grid
  });

  // Event listener for album card click - opening the purchase modal
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Get the form
      const form = document.getElementById("purchaseForm");
      form.reset();
      const albumName = e.currentTarget.dataset.album;
      document.getElementById("albumName").textContent = `${albumName}`;

      let data = loadFromLocalStorage(albumName);
      console.log(data);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          // skip for bought key
          if (key === "bought") {
            return;
          }
          let htmlInput;
          if (key === "payment") {
            if (value !== "") {
              htmlInput = document.querySelector(`input[value="${value}"]`);
              htmlInput.checked = true;
            }
          } else {
            htmlInput = document.getElementById(`${key}`);
            htmlInput.value = value;
          }
          // If the key is 'additionalItems', handle it separately
          if (key === "additionalItems") {
            // Loop through the array and check the checkboxes
            value.forEach((item) => {
              let checkbox = document.getElementById(item);
              if (checkbox) {
                checkbox.checked = true;
              }
            });
          }
        });
      } else {
        data = {
          additionalItems: [],
          address: "",
          albumName: albumName,
          bought: false,
          email: "",
          lastName: "",
          name: "",
          payment: "",
          shipmentDate: "",
          totalPrice: BASE_PRICE,
        };
        // Save the default data to localStorage
        saveToLocalStorage(albumName, data);
      }
      updateTotalPrice();
      // Add an event listener for form changes to each input field
      Array.from(form.elements).forEach(function (element) {
        element.addEventListener("input", handleFormChange);
      });
    });
  });
}

// Update price when buying a particular album
function updateTotalPrice() {
  // Get the total price element
  const totalPriceElement = document.getElementById("totalPrice");

  // Get all the checkboxes
  const checkboxes = document.querySelectorAll("input[type=checkbox]");

  // Function to update the total price
  function calculateTotalPrice() {
    totalPrice = BASE_PRICE; //reset the total price
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
  }

  // Update the total price initially
  calculateTotalPrice();

  // Add event listeners to the checkboxes
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", calculateTotalPrice);
  });
}

// Handle form submission
function handleFormSubmission() {
  // Get the form
  const form = document.getElementById("purchaseForm");

  // Add an event listener for the form submission
  form.addEventListener("submit", function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Handle the form submission
    handleFormChange();

    // Get album name
    let albumName = document.getElementById("albumName").textContent;

    // Load data from localStorage
    let data = loadFromLocalStorage(albumName);

    data["bought"] = true;
    saveToLocalStorage(albumName, data);
    displaySummary(data);

    const hiddenModalToggler = document.getElementById("hiddenModalToggler");
    hiddenModalToggler.click();
    // Log the form data
    console.log(data);
  });
}

// Display the summary
function displaySummary(data) {
  console.log(data);
  for (let key in data) {
    let summary = document.getElementById(`${key}Summary`);
    if (key === "bought") {
      continue;
    }
    summary.innerText = data[key];
    if (key === "additionalItems") {
      summary.innerText = summaryAdditionalItems(data["additionalItems"]);
    }
  }
}

function summaryAdditionalItems(items) {
  let summary = "";
  if (items === undefined) {
    summary = "None";
  } else {
    // For each id in the items array, find the corresponding item in the additionalItems array
    items.forEach((id) => {
      const item = additionalItems.find((item) => item.id === id);
      if (item) {
        // If the item was found, add its description to the summary
        summary += item.description + ", ";
      }
    });

    // Remove the trailing comma and space
    summary = summary.slice(0, -2);
  }
  return summary;
}

// Initialize all functionality when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  fetchAlbums().then((albums) => {
    displayAlbums(albums);
    setAdditionalItems(additionalItems);
    const searchForm = document.getElementById("searchForm");
    searchForm.addEventListener("input", search(albums));
    setShipmentDateAttributes();
    updateTotalPrice();
    handleFormSubmission();
  });
});

const purchases = document.getElementById("purchases");
