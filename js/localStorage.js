// saving to localStorage
export function saveToLocalStorage(albumName, data) {
  localStorage.setItem(albumName, JSON.stringify(data));
}

// loading from localStorage
export function loadFromLocalStorage(albumName) {
  const data = localStorage.getItem(albumName);
  return data ? JSON.parse(data) : null;
}
