import API_KEY from './config.js'

const userTab = document.querySelector('[data-userWeather]')
const searchTab = document.querySelector('[data-searchWeather]')
const grantAccessContainer = document.querySelector('.grant-location-container')
const searchForm = document.querySelector('[data-searchForm]')
const loadingScreen = document.querySelector('.loading-container')
const userInfoContainer = document.querySelector('.user-info-container')
const grantAccessButton = document.querySelector('[data-grantAccess]')
const notFound = document.querySelector('.page-not-found')

let currentTab = userTab
currentTab.classList.add("current-tab")

getFromSessionStorage()

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {

        currentTab.classList.remove("current-tab")
        currentTab = clickedTab
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains('active')) {
            userInfoContainer.classList.remove('active')
            grantAccessContainer.classList.remove('active')
            searchForm.classList.add('active')

            searchForm.classList.remove('form-container-up')
            searchForm.classList.add('form-container-down')
        }
        else {
            notFound.classList.remove('active')
            searchForm.classList.remove('active')
            userInfoContainer.classList.remove('active')
            getFromSessionStorage()
        }
    }
}

// it checks if coordinates are already present in the storage 
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates")
    if (!localCoordinates) {
        grantAccessContainer.classList.add('active')
    }
    else {
        const coordinates = JSON.parse(localCoordinates)
        fetchUserWeatherInfo(coordinates)
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lon, lat } = coordinates

    //lets make grant container invisible
    grantAccessContainer.classList.remove('active')
    loadingScreen.classList.add('active')

    // API Call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        const data = await response.json()

        loadingScreen.classList.remove('active')
        userInfoContainer.classList.add('active')
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove('active')
        console.log(err)
    }

}

function renderWeatherInfo(data) {
    const cityName = document.querySelector('[data-cityName]')
    const countryIcon = document.querySelector('[data-countryIcon ]')
    const desc = document.querySelector('[data-weatherDesc]')
    const weatherIcon = document.querySelector('[data-weatherIcon]')
    const temp = document.querySelector('[data-temp]')
    const windspeed = document.querySelector('[data-windspeed]')
    const humidity = document.querySelector('[data-humidity]')
    const clouds = document.querySelector('[data-cloudiness]')

    cityName.innerText = `${data?.name}`
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`
    desc.innerText = `${data?.weather?.[0]?.description}`
    // weatherIcon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`
    // temp.innerText = `${data?.main?.temp}`
    temp.innerHTML = `${data?.main?.temp}` + `<sup>°C</sup>`
    windspeed.innerText = `${data?.wind?.speed}` + ` km/h`
    humidity.innerText = `${data?.main?.humidity}` + `%`
    clouds.innerText = `${data?.clouds?.all}` + `%`

    // Setting the Weather Icon
    switch (data?.weather?.[0]?.main) {
        case 'Clouds':
            weatherIcon.src = "/assets/cloud.png"
            break

        case 'Clear':
            weatherIcon.src = "/assets/clear.png"
            break

        case 'Rain':
            weatherIcon.src = "/assets/rain.png"
            break

        case 'Mist':
            weatherIcon.src = "/assets/mist.png"
            break

        case 'Snow':
            weatherIcon.src = "/assets/thunder.png"
            break
    }

}

userTab.addEventListener('click', () => {
    switchTab(userTab)
})

searchTab.addEventListener('click', () => {
    switchTab(searchTab)
})

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition)
    }
    else {
        alert('Please Enable Location')
    }
}

function showPosition(position) {

    let userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }
    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates))
    fetchUserWeatherInfo(userCoordinates)
}

grantAccessButton.addEventListener('click', getLocation)

const searchInput = document.querySelector('[data-searchInput]')
searchForm.addEventListener('submit', (event) => {
    event.preventDefault()

    // searchForm.classList.remove('form-container-down')
    // searchForm.classList.add('form-container-up')


    //removing the error message (if there)
    notFound.classList.remove('active')

    let cityName = searchInput.value
    if (cityName === "") return

    else {
        searchForm.classList.remove('form-container-down')
        searchForm.classList.add('form-container-up')
        fetchSearchWeatherInfo(cityName)
    }
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add('active')
    userInfoContainer.classList.remove('active')
    grantAccessContainer.classList.remove('active')

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json()
        loadingScreen.classList.remove('active')

        if (data?.name === undefined) {
            throw data
        }

        userInfoContainer.classList.add('active')
        console.log(data?.name)

        renderWeatherInfo(data)
    }
    catch (error) {
        notFound.classList.add('active')
        searchForm.reset()
        searchForm.classList.add('form-container-down')
    }
}
