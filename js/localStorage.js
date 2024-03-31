export function saveToLocalStorage(albumName, data) {
  localStorage.setItem(albumName, JSON.stringify(data));
}

export function loadFromLocalStorage(albumName) {
  const data = localStorage.getItem(albumName);
  return data ? JSON.parse(data) : null;
}
