import { useState } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setHourly(forecastData.list.slice(0, 8));

      const dailyData = forecastData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      );
      setWeekly(dailyData.slice(0, 7));
    } catch (error) {
      alert('Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  // Use current location
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        alert('Location permission denied');
      }
    );
  };

  // Search city
  const searchWeather = async () => {
    if (!city.trim()) return;

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      const data = await res.json();

      if (data.cod === 200) {
        fetchWeatherByCoords(data.coord.lat, data.coord.lon);
        setCity('');
      } else {
        alert('City not found');
      }
    } catch {
      alert('Search failed');
    }
  };

  if (loading) {
    return (
      <div className='screen'>
        <h2 className='loading'>Loading weather...</h2>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className='screen'>
        <div className='welcome-card'>
          <div className='emoji'>🌦️</div>
          <h2>Smart Weather</h2>
          <p>Check weather for your location or search any city.</p>

          <button className='primary-btn' onClick={handleUseLocation}>
            📍 Use My Location
          </button>

          <div className='search' style={{ marginTop: '20px' }}>
            <input
              type='text'
              placeholder='Search city...'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') searchWeather();
              }}
            />
            <button onClick={searchWeather}>Search</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='screen'>
      <div className='dashboard'>

        {/* LEFT */}
        <div className='left-panel'>

          <div className='top-bar'>
            <button onClick={handleUseLocation}>📍 My Location</button>
          </div>

          <div className='search'>
            <input
              type='text'
              placeholder='Search city...'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') searchWeather();
              }}
            />
            <button onClick={searchWeather}>Search</button>
          </div>

          <div className='current-weather'>
            <div className='emoji large'>🌤️</div>
            <h2>{weather.name}, {weather.sys.country}</h2>
            <h1>{Math.round(weather.main.temp)}°C</h1>
            <p className='condition'>{weather.weather[0].description}</p>
          </div>

          <div className='details-grid'>
            <div className='detail-box'>
              <span>🌡️</span>
              <p>Feels Like</p>
              <strong>{Math.round(weather.main.feels_like)}°C</strong>
            </div>

            <div className='detail-box'>
              <span>💧</span>
              <p>Humidity</p>
              <strong>{weather.main.humidity}%</strong>
            </div>

            <div className='detail-box'>
              <span>💨</span>
              <p>Wind</p>
              <strong>{(weather.wind.speed * 3.6).toFixed(1)} km/h</strong>
            </div>

            <div className='detail-box'>
              <span>👁️</span>
              <p>Visibility</p>
              <strong>{(weather.visibility / 1000).toFixed(1)} km</strong>
            </div>

            <div className='detail-box'>
              <span>📊</span>
              <p>Pressure</p>
              <strong>{weather.main.pressure} hPa</strong>
            </div>

            <div className='detail-box'>
              <span>🌅</span>
              <p>Sunrise</p>
              <strong>
                {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className='right-panel'>

          <div className='section'>
            <h3>Today’s Forecast</h3>

            <div className='forecast-row'>
              {hourly.map((item, index) => (
                <div className='forecast-card' key={index}>
                  <p>
                    {new Date(item.dt_txt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt='icon'
                  />

                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>

          <div className='section'>
            <h3>Weekly Forecast</h3>

            <div className='forecast-row'>
              {weekly.map((day, index) => (
                <div className='forecast-card' key={index}>
                  <p>
                    {new Date(day.dt_txt).toLocaleDateString([], {
                      weekday: 'short',
                    })}
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt='icon'
                  />

                  <p>
                    {Math.round(day.main.temp_max)}° /{' '}
                    {Math.round(day.main.temp_min)}°
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;