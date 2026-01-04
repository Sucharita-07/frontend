const apiKey = "a8146c5842d298ae9f4bd04ba1696945";
let chart;

async function getWeather(cityFromLocation = null, lat = null, lon = null) {
    const errorDiv = document.getElementById("error");
    const card = document.getElementById("weatherCard");

    errorDiv.innerText = "";
    card.style.display = "none";

    let weatherUrl, forecastUrl;

    if (cityFromLocation) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else {
        const city = document.getElementById("cityInput").value;
        if (!city) {
            errorDiv.innerText = "Please enter a city name";
            return;
        }
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    }

    try {
        const res = await fetch(weatherUrl);
        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

        document.getElementById("cityName").innerText =
            `${data.name}, ${regionNames.of(data.sys.country)}`;

        document.getElementById("temperature").innerText =
            `${Math.round(data.main.temp)}°C`;

        document.getElementById("description").innerText =
            data.weather[0].description;

        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("wind").innerText = data.wind.speed;

        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        const rainProb = Math.round(forecastData.list[0].pop * 100);
        document.getElementById("rainProb").innerText =
            `🌧️ Rain Probability: ${rainProb}%`;

        document.getElementById("climateProb").innerText =
            getClimateProbability(data.clouds.all);

        document.getElementById("season").innerText =
            `🌍 Season: ${getSeason(data.coord.lat)}`;

        document.getElementById("suggestion").innerText =
            getSuggestion(data.weather[0].main);

        createChart(rainProb, data.clouds.all);

        card.style.display = "block";

    } catch (error) {
        errorDiv.innerText = error.message;
    }
}

// 📍 Auto Detect User Location
function getUserLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeather(true, lat, lon);
    });
}

// 📊 Probability Chart
function createChart(rain, clouds) {
    const sunny = Math.max(0, 100 - clouds);
    const cloudy = clouds;

    const ctx = document.getElementById("weatherChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Rain", "Sunny", "Cloudy"],
            datasets: [{
                label: "Weather Probability (%)",
                data: [rain, sunny, cloudy]
            }]
        }
    });
}

// Helper Functions
function getClimateProbability(clouds) {
    if (clouds < 20) return "☀️ Sunny Probability: 80%";
    if (clouds < 50) return "⛅ Partly Cloudy Probability: 60%";
    if (clouds < 80) return "☁️ Cloudy Probability: 70%";
    return "🌧️ Rainy Probability: High";
}

function getSeason(lat) {
    const month = new Date().getMonth() + 1;
    const north = lat >= 0;

    if (north) {
        if (month <= 2 || month === 12) return "Winter ❄️";
        if (month <= 5) return "Spring 🌸";
        if (month <= 8) return "Summer ☀️";
        return "Autumn 🍂";
    } else {
        if (month <= 2 || month === 12) return "Summer ☀️";
        if (month <= 5) return "Autumn 🍂";
        if (month <= 8) return "Winter ❄️";
        return "Spring 🌸";
    }
}

function getSuggestion(weather) {
    if (weather === "Clear") return "Great day for outdoor activities!";
    if (weather === "Rain") return "Carry an umbrella and stay safe.";
    if (weather === "Snow") return "Wear warm clothes.";
    if (weather === "Clouds") return "Comfortable weather today.";
    return "Have a great day!";
}
