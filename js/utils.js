import { displayAlbums } from "./index.js";

export function search(albums) {
  return function (e) {
    const query = e.target.value.toLowerCase();
    const filteredAlbums = albums.filter((album) =>
      album.name.toLowerCase().includes(query)
    );
    displayAlbums(filteredAlbums);
  };
}

// Set max/min attributes for shipment date
export function setShipmentDateAttributes() {
  const shipmentDateInput = document.getElementById("shipmentDate");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 60);

  // Format the dates in the 'YYYY-MM-DD' format
  const minDate = tomorrow.toISOString().split("T")[0];
  const maxDate = twoWeeksFromNow.toISOString().split("T")[0];

  shipmentDateInput.setAttribute("min", minDate);
  shipmentDateInput.setAttribute("max", maxDate);
}
