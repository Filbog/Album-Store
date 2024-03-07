// API request setup
const APIKEY = "89f20445788ab5ad5af51b3231833937"; // my Last.fm API key
const artist = "Led%20Zeppelin";
const limit = 20;
const url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${artist}&api_key=${APIKEY}&format=json&limit=${limit}`;

// Base album price for simplicity
const BASE_PRICE = 49;

// Fetch albums from API
function fetchAlbums() {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      displayAlbums(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Display albums on the page
function displayAlbums(data) {
  const albums = data.topalbums.album;
  const displayAlbums = document.getElementById("display-albums");
  displayAlbums.innerHTML = ""; // clear the div

  albums.forEach((album) => {
    const albumDiv = document.createElement("div");
    albumDiv.className =
      "col-12 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center"; // Bootstrap grid classes

    albumDiv.innerHTML = `
      <div class="card m-2" style="width: 18rem;">
        <img src="${album.image[2]["#text"]}" class="card-img-top album-image" alt="${album.name}">
        <div class="card-body">
          <h5 class="card-title">${album.name}</h5>
        </div>
        <div class="card-img-overlay d-flex align-items-center justify-content-center">
        <button class="btn btn-primary buy-button px-3 py-2" data-bs-toggle="modal" data-bs-target="#purchaseModal" type="button" data-album="${album.name}">Buy now</button>
      </div>
      </div>
    `;
    displayAlbums.appendChild(albumDiv); // append the albumDiv to displayAlbums
  });

  // Add event listener to "Buy" buttons
  document.querySelectorAll(".buy-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const albumName = event.target.dataset.album;
      console.log(albumName);
      document.getElementById("albumName").textContent = `${albumName}`;
      // Update the rest of the modal content here
      // new bootstrap.Modal(document.getElementById('purchaseModal')).show();
    });
  });
}

// Set max/min attributes for shipment date
function setShipmentDateAttributes() {
  // Select the input element
  var shipmentDateInput = document.getElementById("shipmentDate");

  // Calculate tomorrow's date and 14 days from now
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 60);

  // Format the dates in the 'YYYY-MM-DD' format
  var minDate = tomorrow.toISOString().split("T")[0];
  var maxDate = twoWeeksFromNow.toISOString().split("T")[0];

  // Set the shipment date attrs
  shipmentDateInput.setAttribute("min", minDate);
  shipmentDateInput.setAttribute("max", maxDate);
}

// Update price when buying a particular album
function updateTotalPrice() {
  // Get the total price element
  var totalPriceElement = document.getElementById("totalPrice");

  // Get all the checkboxes
  var checkboxes = document.querySelectorAll("input[type=checkbox]");

  // Function to update the total price
  function calculateTotalPrice() {
    var totalPrice = BASE_PRICE;

    // Add the price of each checked checkbox to the total price
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        totalPrice += parseFloat(checkbox.value);
      }
    });

    // Update the total price element
    totalPriceElement.textContent =
      "Total price: " + totalPrice.toFixed(2) + "$";
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
  var form = document.getElementById("purchaseForm");

  // Add an event listener for the form
  form.addEventListener("submit", function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get the form data
    var formData = new FormData(form);

    // Create an object to hold the form data
    var data = {};
    formData.forEach(function (value, key) {
      // If the key is 'additional', we need to handle it separately
      if (key === "additional") {
        // If 'additional' is not yet in the data object, add it as an object
        if (!data[key]) {
          data[key] = {};
        }
        // Get the item name from the checkbox
        var itemName = form.querySelector(
          `input[name="${key}"][value="${value}"]`
        ).id;
        // Add the value to the 'additional' object with the item name as the key
        data[key][itemName] = parseFloat(value);
      } else {
        // For other keys, just assign the value
        data[key] = value;
      }
    });

    // get album name and add it to the data object
    let albumName = document.getElementById("albumName").textContent;
    data["albumName"] = albumName;

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
  // Insert the summary into the modal body
  document.querySelector("#summaryAlbumTitle").innerText = data["albumName"];
  document.querySelector("#summaryName").innerText = data["name"];
  document.querySelector("#summaryLastName").innerText = data["last_name"];
  document.querySelector("#summaryEmail").innerText = data["email"];
  document.querySelector("#summaryAddress").innerText = data["address"];
  document.querySelector("#summaryPayment").innerText = data["payment"];
  document.querySelector("#summaryShipmentDate").innerText =
    data["shipmentDate"];
}

// Initialize all functionality when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  fetchAlbums();
  setShipmentDateAttributes();
  updateTotalPrice();
  handleFormSubmission();
});
