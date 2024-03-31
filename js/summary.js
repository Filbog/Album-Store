import { additionalItems } from "./additionalItems.js";

export function displaySummary(data) {
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
    items.forEach((id) => {
      const item = additionalItems.find((item) => item.id === id);
      if (item) {
        summary += item.description + ", ";
      }
    });

    // Remove the trailing comma and space
    summary = summary.slice(0, -2);
  }
  return summary;
}
