export async function fetchCities(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'de'
      },
      method: 'GET'
    });
    if (!response.ok) throw new Error('Netzwerkfehler');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler bei der API-Abfrage:', error);
    return [];
  }
}
