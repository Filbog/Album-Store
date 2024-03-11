// API request setup
const APIKEY = "89f20445788ab5ad5af51b3231833937"; // my Last.fm API key
const artist = "Led%20Zeppelin"; //for simplicity
const limit = 30;
const url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${artist}&api_key=${APIKEY}&format=json&limit=${limit}`;

const BASE_PRICE = 49; // Base album price for simplicity
let totalPrice; // Total price of the purchase

// saving to localStorage
function saveToLocalStorage(albumName, data) {
  localStorage.setItem(albumName, JSON.stringify(data));
}

// loading from localStorage
function loadFromLocalStorage(albumName) {
  const data = localStorage.getItem(albumName);
  return data ? JSON.parse(data) : null;
}

//search functionality
searchForm = document.getElementById("searchForm");
searchForm.addEventListener("input", function (e) {
  const query = e.target.value.toLowerCase();
  const filteredAlbums = albums.filter((album) =>
    album.name.toLowerCase().includes(query)
  );
  displayAlbums(filteredAlbums);
});

const additionalItems = [
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
      albums = data.topalbums.album;
      displayAlbums(albums);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Display albums on the page
function displayAlbums(albums) {
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

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      document.getElementById("purchaseForm").reset();
      const albumName = e.currentTarget.dataset.album;
      document.getElementById("albumName").textContent = `${albumName}`;

      const data = loadFromLocalStorage(albumName);
      console.log(data);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          // skip for bought key
          if (key === "bought") {
            return;
          }
          let htmlInput;
          if (key === "payment") {
            htmlInput = document.querySelector(`input[value="${value}"]`);
            htmlInput.checked = true;
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
          // console.log(key);
          // console.log(htmlInput);
        });
      }
      updateTotalPrice();
    });
  });
}

// Set max/min attributes for shipment date
function setShipmentDateAttributes() {
  // Select the input element
  const shipmentDateInput = document.getElementById("shipmentDate");

  // Calculate tomorrow's date and 14 days from now
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 60);

  // Format the dates in the 'YYYY-MM-DD' format
  const minDate = tomorrow.toISOString().split("T")[0];
  const maxDate = twoWeeksFromNow.toISOString().split("T")[0];

  // Set the shipment date attrs
  shipmentDateInput.setAttribute("min", minDate);
  shipmentDateInput.setAttribute("max", maxDate);
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

  // Add an event listener for the form
  form.addEventListener("submit", function (event) {
    // Prevent the default form submission
    event.preventDefault();

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

    data["bought"] = true;

    displaySummary(data);

    const hiddenModalToggler = document.getElementById("hiddenModalToggler");
    hiddenModalToggler.click();
    // Log the form data
    console.log(data);
    saveToLocalStorage(albumName, data);
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

// Set up additional items
function setAdditionalItems(items) {
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
  fetchAlbums();
  setAdditionalItems(additionalItems);
  setShipmentDateAttributes();
  updateTotalPrice();
  handleFormSubmission();
});

function albumsValidation(albums) {
  //starting from the end of the array so that deleting the el won't make the loop skip any els
  for (let i = albums.length - 1; i >= 0; i--) {
    //some entries come empty from the API, we don't want those displayed
    if (albums[i].name === "(null)") {
      albums.splice(i, 1);
    }
    //albums with no image
  }
  return albums;
}

// // Add event listener to "Buy" buttons, instead of cards that are now
// document.querySelectorAll(".buy-button").forEach((button) => {
//   button.addEventListener("click", (event) => {
//     const albumName = event.target.dataset.album;
//     console.log(albumName);
//     document.getElementById("albumName").textContent = `${albumName}`;
//   });
// });
