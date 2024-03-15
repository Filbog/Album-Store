import { search, setShipmentDateAttributes } from "./utils.js";
import { fetchAlbums } from "./api.js";
import { saveToLocalStorage, loadFromLocalStorage } from "./localStorage.js";
import { additionalItems, setAdditionalItems } from "./additionalItems.js";
import { displaySummary } from "./summary.js";
import { updateTotalPrice, BASE_PRICE } from "./updateTotalPrice.js";

// const body = document.querySelector("body");

// Function to handle form changes
function handleFormChange() {
  // Get the form
  const form = document.getElementById("purchaseForm");
  // get album name and add it to the data object
  let albumName = document.getElementById("albumName").textContent;

  // Get the form data
  const formData = new FormData(form);

  // Create an object to hold the form data
  const data = loadFromLocalStorage(albumName);
  data.additionalItems = []; //clearing the array
  formData.forEach(function (value, key) {
    // Handle additional items separately
    if (key === "additionalItems") {
      // Get the item name from the checked checkbox (FormData only notices checked checkboxes...)
      let itemName = form.querySelector(
        `input[name="${key}"][value="${value}"]`
      ).id;
      data.additionalItems.push(itemName);
    } else {
      // For other keys, just assign the value
      data[key] = value;
    }
  });
  data["totalPrice"] = updateTotalPrice(); //add total price

  // Save the form data to localStorage
  saveToLocalStorage(albumName, data);
}

// Display albums on the page
export function displayAlbums(albums) {
  console.log("displaying albums...");
  console.log(albums);
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
    const card = albumDiv.querySelector(".card");
    displayAlbums.appendChild(albumDiv); // append albumDiv to the grid
    card.addEventListener("click", () => handleCardClick(album.name));
  });
}

function handleCardClick(albumName) {
  console.log(albumName);

  const form = document.getElementById("purchaseForm");
  form.reset(); // Clear the form from different albums
  document.getElementById("albumName").textContent = `${albumName}`;

  let data = loadFromLocalStorage(albumName);
  console.log(data);
  let purchaseBtn = document.getElementById("purchaseBtn");
  purchaseBtn.textContent = "Purchase";
  if (data) {
    console.log(data);
    Object.entries(data).forEach(([key, value]) => {
      // Change text in submit btn whether the album was bought or not
      if (key === "bought") {
        if (value === true) {
          purchaseBtn.textContent = "Save changes";
        }
        return;
      }
      let htmlInput;
      if (key === "payment") {
        if (value != "") {
          console.log("KEY", key, "VALUE", value);
          htmlInput = document.querySelector(`input[value="${value}"]`);
          htmlInput.checked = true;
        } else {
          return;
        }
      } else {
        htmlInput = document.getElementById(`${key}`);
        console.log("KEY", key);
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
}

// Handle form submission
function handleFormSubmission() {
  // Handle the form changes
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
}

// Initialize all functionality when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  fetchAlbums().then((albums) => {
    displayAlbums(albums);
    setAdditionalItems(additionalItems);
    // getPurchased(albums);
    const searchForm = document.getElementById("searchForm");
    searchForm.addEventListener("input", search(albums));

    // Get the form
    const form = document.getElementById("purchaseForm");
    // Add an event listener for the form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleFormSubmission();
    });
    setShipmentDateAttributes();
    updateTotalPrice();

    const ordersBtn = document.getElementById("ordersBtn");
    ordersBtn.addEventListener("click", () => {
      getPurchased(albums);
    });
  });
});

const purchases = document.getElementById("purchases");
function getPurchased(albums) {
  let alertPlaceholder = document.getElementById("alertPlaceholder");
  const purchasedAlbums = [];
  purchases.innerHTML = "";
  albums.forEach((album) => {
    let albumLS = loadFromLocalStorage(album.name);
    if (albumLS !== null) {
      if (albumLS.bought === true) {
        purchasedAlbums.push(albumLS.albumName);
        // Create a new div element
        let orderedAlbumDiv = document.createElement("div");
        orderedAlbumDiv.classList = "mx-auto mb-3";

        // Create the h5 element
        let h5 = document.createElement("h5");
        h5.textContent = `${albumLS.albumName} - ${albumLS.totalPrice}$`;
        orderedAlbumDiv.appendChild(h5);

        // Create the edit button
        let editBtn = document.createElement("button");
        editBtn.className = "btn btn-primary";
        editBtn.textContent = "Edit";
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#purchaseModal");
        editBtn.addEventListener("click", function () {
          // Retrieve the data from localStorage
          handleCardClick(albumLS.albumName);
          // Do something with the data...
        });
        orderedAlbumDiv.appendChild(editBtn);

        // Create the cancel button
        let cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-danger cancelOrderBtn";
        cancelBtn.textContent = "Cancel";
        cancelBtn.setAttribute("data-bs-dismiss", "modal");
        cancelBtn.addEventListener("click", function () {
          // Delete the album from localStorage
          localStorage.removeItem(albumLS.albumName);
          alertPlaceholder.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert" id="deleteAlert">
              <strong class=''>Order cancelled</strong>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        });
        orderedAlbumDiv.appendChild(cancelBtn);

        // Append the div to purchases
        purchases.appendChild(orderedAlbumDiv);
      }
    }
  });
}

// cancelBtn.addEventListener("click", function () {});
