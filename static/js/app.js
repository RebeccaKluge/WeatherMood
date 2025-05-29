import { fetchCities } from './city.js';

const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');

function saveSelectedCity(city) {
    const cityNameOnly = city.address?.city || city.address?.town || city.address?.village || city.display_name.split(',')[0];
  
    localStorage.setItem('selectedCity', cityNameOnly);
    localStorage.setItem('selectedCityLat', city.lat);
    localStorage.setItem('selectedCityLon', city.lon);
    alert(`Gespeichert: ${city.display_name} (${city.lat}, ${city.lon})`);
    location.reload();  

}

function clearSuggestions() {
  suggestions.innerHTML = '';
}

function showSuggestions(cities) {
  clearSuggestions();
  cities.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city.display_name;
    li.addEventListener('click', () => {
      searchInput.value = city.display_name;
      clearSuggestions();
      saveSelectedCity(city);
    });
    suggestions.appendChild(li);
  });
}

let debounceTimeout;
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  clearTimeout(debounceTimeout);

  if (query.length >= 2) {
    debounceTimeout = setTimeout(async () => {
      const cities = await fetchCities(query);
      if (cities.length > 0) {
        showSuggestions(cities);
      } else {
        clearSuggestions();
      }
    }, 300);
  } else {
    clearSuggestions();
  }
});

// Enter zum Bestätigen der ersten Stadt in der Liste
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (suggestions.firstChild) {
      const firstCityName = suggestions.firstChild.textContent;
      fetchCities(firstCityName).then(cities => {
        if (cities.length > 0) {
          saveSelectedCity(cities[0]);
          clearSuggestions();
        } else {
          alert('Keine Stadt gefunden.');
        }
      });
    } else {
      alert('Keine Stadt ausgewählt.');
    }
  }
});

// Klick außerhalb schließt Vorschläge
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    clearSuggestions();
  }
});
