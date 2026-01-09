// Subway Surfers World Tour Cities
const CITIES = [
    // Americas
    { name: 'San Francisco', url: 'index.html', flag: '🌉', region: 'americas' },
    { name: 'New York', url: 'newyork.html', flag: '🗽', region: 'americas' },
    { name: 'Miami', url: 'miami.html', flag: '🌴', region: 'americas' },
    { name: 'New Orleans', url: 'neworleans.html', flag: '🎺', region: 'americas' },
    { name: 'Houston', url: 'houston.html', flag: '🤠', region: 'americas' },
    { name: 'Chicago', url: 'chicago.html', flag: '🏙️', region: 'americas' },
    { name: 'Los Angeles', url: 'losangeles.html', flag: '🎬', region: 'americas' },
    { name: 'Las Vegas', url: 'lasvegas.html', flag: '🎰', region: 'americas' },
    { name: 'Buenos Aires', url: 'buenos-aires.html', flag: '🇦🇷', region: 'americas' },
    { name: 'Mexico City', url: 'mexico.html', flag: '🇲🇽', region: 'americas' },
    { name: 'Havana', url: 'havana.html', flag: '🇨🇺', region: 'americas' },
    { name: 'Peru', url: 'peru.html', flag: '🇵🇪', region: 'americas' },
    { name: 'Hawaii', url: 'hawaii.html', flag: '🌺', region: 'americas' },

    // Europe
    { name: 'London', url: 'london.html', flag: '🇬🇧', region: 'europe' },
    { name: 'Paris', url: 'paris.html', flag: '🇫🇷', region: 'europe' },
    { name: 'Berlin', url: 'berlin.html', flag: '🇩🇪', region: 'europe' },
    { name: 'Rome', url: 'rome.html', flag: '🇮🇹', region: 'europe' },
    { name: 'Barcelona', url: 'barcelona.html', flag: '🇪🇸', region: 'europe' },
    { name: 'Zurich', url: 'zurich.html', flag: '🇨🇭', region: 'europe' },
    { name: 'Amsterdam', url: 'amsterdam.html', flag: '🇳🇱', region: 'europe' },
    { name: 'Prague', url: 'prague.html', flag: '🇨🇿', region: 'europe' },
    { name: 'Venice', url: 'venice.html', flag: '🛶', region: 'europe' },
    { name: 'Monaco', url: 'monaco.html', flag: '🇲🇨', region: 'europe' },
    { name: 'Athens', url: 'athens.html', flag: '🇬🇷', region: 'europe' },
    { name: 'St Petersburg', url: 'stpetersburg.html', flag: '🇷🇺', region: 'europe' },
    { name: 'Copenhagen', url: 'copenhagen.html', flag: '🇩🇰', region: 'europe' },
    { name: 'Iceland', url: 'iceland.html', flag: '🇮🇸', region: 'europe' },

    // Asia
    { name: 'Tokyo', url: 'tokyo.html', flag: '🇯🇵', region: 'asia' },
    { name: 'Seoul', url: 'seoul.html', flag: '🇰🇷', region: 'asia' },
    { name: 'Beijing', url: 'beijing.html', flag: '🇨🇳', region: 'asia' },
    { name: 'Singapore', url: 'singapore.html', flag: '🇸🇬', region: 'asia' },
    { name: 'Mumbai', url: 'mumbai.html', flag: '🇮🇳', region: 'asia' },
    { name: 'Bangkok', url: 'bangkok.html', flag: '🇹🇭', region: 'asia' },
    { name: 'Arabia', url: 'arabia.html', flag: '🕌', region: 'asia' },
    { name: 'Bali', url: 'bali.html', flag: '🇮🇩', region: 'asia' },

    // Oceania & Africa
    { name: 'Sydney', url: 'sydney.html', flag: '🇦🇺', region: 'oceania' },
    { name: 'Cairo', url: 'cairo.html', flag: '🇪🇬', region: 'africa' },
    { name: 'Kenya', url: 'kenya.html', flag: '🇰🇪', region: 'africa' },
    { name: 'Marrakesh', url: 'marrakesh.html', flag: '🇲🇦', region: 'africa' },

    // Special
    { name: 'Winter Holiday', url: 'winterholiday.html', flag: '❄️', region: 'special' },
    { name: 'Space Station', url: 'spacestation.html', flag: '🚀', region: 'special' },
    { name: 'North Pole', url: 'northpole.html', flag: '🎅', region: 'special' },
];

const BASE_URL = 'https://yell0wsuit.page/assets/games/subway-surfers-unity/';

// Check if we're on a game page
function checkCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const isOnGame = tab && tab.url && tab.url.includes('yell0wsuit.page/assets/games/subway-surfers-unity/');

        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');

        if (isOnGame) {
            statusDot.classList.remove('inactive');
            // Extract current city from URL
            const urlParts = tab.url.split('/');
            const currentPage = urlParts[urlParts.length - 1].replace('.html', '');
            const currentCity = CITIES.find(c => c.url.replace('.html', '') === currentPage);
            statusText.textContent = currentCity ? `PLAYING: ${currentCity.name.toUpperCase()}` : 'HACKS ACTIVE';
        } else {
            statusDot.classList.add('inactive');
            statusText.textContent = 'NOT ON GAME PAGE';
        }
    });
}

// Navigate to a city
function navigateToCity(url) {
    const fullUrl = BASE_URL + url;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: fullUrl });
        window.close();
    });
}

// Create city button
function createCityButton(city) {
    const btn = document.createElement('button');
    btn.className = 'city-btn';
    btn.dataset.url = city.url;
    btn.dataset.name = city.name.toLowerCase();
    btn.innerHTML = `<span class="flag">${city.flag}</span>${city.name.toUpperCase()}`;
    btn.addEventListener('click', () => navigateToCity(city.url));
    return btn;
}

// Populate city grid
function populateCities() {
    const grid = document.getElementById('city-grid');
    grid.innerHTML = '';

    // Sort alphabetically
    const sortedCities = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));

    sortedCities.forEach(city => {
        if (city.url !== 'index.html') { // Skip San Francisco (it's in featured)
            grid.appendChild(createCityButton(city));
        }
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search');
    const grid = document.getElementById('city-grid');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const buttons = grid.querySelectorAll('.city-btn');

        buttons.forEach(btn => {
            const name = btn.dataset.name;
            if (query === '' || name.includes(query)) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        });
    });
}

// Setup featured city click
function setupFeatured() {
    const featuredBtn = document.querySelector('.city-btn.featured');
    if (featuredBtn) {
        featuredBtn.addEventListener('click', () => {
            navigateToCity(featuredBtn.dataset.url);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkCurrentPage();
    populateCities();
    setupSearch();
    setupFeatured();
});
