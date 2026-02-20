function triggerSearch() {
  const query = document.querySelector('.search-bar').value.trim();
  if (query) console.log('Search:', query);
}

document.querySelector('.search-bar').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') triggerSearch();
});

document.querySelector('.search-btn').addEventListener('click', triggerSearch);
