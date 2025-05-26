const weatherCodes = {
    superSunny: "SUNNY DAY WALK",                  // Klar
    sunny: "TAKE THAT COFFEE OUTSIDE",             // Hauptsächlich klar
    cloudy: "GOOD WEATHER FOR GOOD IDEAS",         // Teilweise bewölkt
    superCloudy: "STAY COZY, IT’S CLOUDY",         // Bewölkt
    rainy: "LIGHT RAIN – TAKE A HOODIE",           // Leichter Regen
    rain: "DON’T FORGET YOUR UMBRELLA",            // Mäßiger Regen
    superRain: "NETFLIX AND CHILL WEATHER",        // Regenschauer
    snowy: "WANNA BUILD A SNOWMAN?",               // Schnee
    foggy: "GRAB A TEA AND SLOW DOWN"               // Nebel
};

const weatherVideos = {
    superSunny: "static/media/sun.mp4",
    sunny: "static/media/sun.mp4",
    cloudy: "static/media/clouds.mp4",
    superCloudy: "static/media/clouds.mp4",
    rainy: "static/media/rain.mp4",
    rain: "static/media/rain.mp4",
    superRain: "static/media/lightning.mp4",
    snowy: "static/media/snow.mp4",
    foggy: "static/media/fog.mp4"
};

const cityCoordinates = {
    "Berlin":     { lat: 52.52,    lon: 13.405 },
    "Hamburg":     { lat: 53.5511,   lon: 9.9937 },
    "New York":   { lat: 40.7128,  lon: -74.006 },
    "London":     { lat: 51.5072,  lon: -0.1276 },
    "Cape Town":  { lat: -33.9249, lon: 18.4241 },
    "São Paulo":  { lat: -23.5505, lon: -46.6333 },
    "Los Angeles":{ lat: 34.0522,  lon: -118.2437 },
    "Cairo":      { lat: 30.0444,  lon: 31.2357 }
};
  

function getWeatherGroup(code) {
    if (code === 0) return "superSunny";                          // Clear sky
    if (code === 1) return "sunny";                                // Mainly clear
    if (code === 2) return "cloudy";                               // Partly cloudy
    if (code === 3) return "superCloudy";                          // Overcast
  
    if ([45, 48].includes(code)) return "foggy";                   // Fog & rime fog
  
    if ([51, 53, 55, 56, 57, 61].includes(code)) return "rainy";   // Light/moderate/dense drizzle or slight rain
    if ([63, 65, 66, 67, 81].includes(code)) return "rain";        // Moderate/heavy rain, freezing rain, moderate showers
    if ([80, 82].includes(code)) return "superRain";               // Rain showers (slight/violent)
  
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";   // Snowfall, grains, showers
  
    if ([95, 96, 99].includes(code)) return "superRain";           // Thunderstorm, hail → Not own category: covered as heavy rain
  
    return "cloudy"; 
}
  
let cityName = localStorage.getItem("selectedCity")
console.log("selectedCity:", cityName); 

const coords = cityCoordinates[cityName] || cityCoordinates["Hamburg"];
const latitude = coords.lat;
const longitude = coords.lon;

const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&hourly=precipitation_probability,relative_humidity_2m&timezone=auto`;

document.getElementById("cityName").textContent = cityName.toUpperCase();

const cityTimeZones = {
  "Berlin": "Europe/Berlin",
  "New York": "America/New_York",
  "London": "Europe/London",
  "Cape Town": "Africa/Johannesburg",
  "São Paulo": "America/Sao_Paulo",
  "Los Angeles": "America/Los_Angeles",
  "Cairo": "Africa/Cairo",
  "Hamburg": "Europe/Berlin"
};

  
const timeZone = cityTimeZones[cityName] || "UTC";
  
const now = new Date();
  
const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZone
};
  
const formatter = new Intl.DateTimeFormat("en-US", options);
const parts = formatter.formatToParts(now);
  
const month = parts.find(p => p.type === "month").value;
const day = parts.find(p => p.type === "day").value;
const year = parts.find(p => p.type === "year").value;
const hour = parts.find(p => p.type === "hour").value;
const minute = parts.find(p => p.type === "minute").value;
const dayPeriod = parts.find(p => p.type === "dayPeriod").value.toLowerCase();
  
const formattedTime = `${month}/${day}/${year} - ${hour}:${minute}${dayPeriod}`;
  
document.getElementById("cityTime").textContent = formattedTime;
  
const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000)); //Show Overlay for 3 sec

// fetch(apiUrl)
//     .then(response => response.json())
//     .then(data => {

Promise.all([
    fetch(apiUrl).then(response => response.json()),
    minLoadingTime
    ])
    .then(([data]) => {
        const current = data.current;
        const nowHour = new Date().toISOString().slice(0, 13); 
        const index = data.hourly.time.findIndex(t => t.startsWith(nowHour));
      
        const group = getWeatherGroup(current.weathercode);
      
        document.getElementById("temperature").textContent = `${current.temperature_2m} °C`;
        document.getElementById("windText").textContent = `${current.windspeed_10m} km/h`;
        document.getElementById("weatherText").textContent = weatherCodes[group] || "WE HAVE AN UNKNOWN WEATHER";
      
        if (index !== -1) {
          const humidity = data.hourly.relative_humidity_2m[index];
          const rainProbability = data.hourly.precipitation_probability[index];
          document.getElementById("waterText").textContent = `${humidity} %`;
          document.getElementById("rainText").textContent = `${rainProbability} %`;
        } else {
          document.getElementById("waterText").textContent = "–";
          document.getElementById("rainText").textContent = "–";
        }
      
        const videoPath = weatherVideos[group] || "static/media/sun.mp4";
        const video = document.getElementById("weatherVideo");
        const source = document.getElementById("videoSource");
      
        if (!source.src.endsWith(videoPath)) {
          source.src = videoPath;
          video.load();
          video.play();
        }
      
        //close Overlay
        const overlay = document.getElementById("loadingOverlay");
        if (overlay) overlay.style.display = "none";
    })
    .catch(error => {
        console.error("Fehler beim Abrufen der Daten:", error);
        document.getElementById("temperature").textContent = "Temperatur: Fehler beim Laden";
      
        const overlay = document.getElementById("loadingOverlay");
        if (overlay) overlay.style.display = "none";
    });
      