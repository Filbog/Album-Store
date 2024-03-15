import { additionalItems } from "./additionalItems.js";

// Display the summary
export function displaySummary(data) {
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
