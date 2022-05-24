// location
const getLocUrl = 'https://api.openweathermap.org/geo/1.0/direct?appid=9094815cf69de4af2049665b33b7f363&'
// url for forecast api
const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall?&appid=9094815cf69de4af2049665b33b7f363&units=imperial&include=current'
// form 
const formEl = $('#city-form');
// city name
const cityNameEl = $('#cityName');
// card
let weatherCardsEl = $('#weatherCards');
// current day
let currDayEl = $('#currDay');
// current 
let currConditionsEl = $('#currConditions');
// history
let historyEl = $('#history');
// cities
let cities = [];
// cities from local storage
let storedCities = ''
let q = '';

loadCities();

function loadCities() {
  historyEl.text('');
  storedCities = JSON.parse(localStorage.getItem("cities"));
  if (storedCities) {
    for (let i = 0; i < storedCities.length; i++) {
      let cityBtn = $(
        `<button id="${i}" data-q="${storedCities[i]}" class="btn btn-primary city-btn my-2">${storedCities[i]}</button><br />`
      );
      historyEl.append(cityBtn);
    }
  }
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  // Directly return the joined string
  return splitStr.join(' '); 
}

// first letter of a string to uppercase
function capitalizeFirstLetter(str) {

  // Uppercase
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);

  return capitalized;
}

function formHandler(event) {
  event.preventDefault();
  // clear any dta from weatherCardsEl
  currConditionsEl.text('');
  weatherCardsEl.text('');
  currConditionsEl.removeClass('border border-dark border-2')
  
  // check submit button

  if (formEl.attr('data-q')) {
    q = titleCase(formEl.attr('data-q'));
    // clear the button attribute so it will not persist if the 
    // next search is from the form.
    formEl.attr('data-q', '');
  } else {
    q = titleCase($('input[name="city-input"]').val().trim());
  }
  
  let cityRequestUrl = `${getLocUrl}&q=${q}`;
  fetch(cityRequestUrl)
    .then(function (response) {
      // response
      return response.json();
    })
    .then(function (data) {
      let lat = data[0].lat;
      let lon = data[0].lon;
      
      //url
      let requestUrl = `${baseUrl}&lon=${lon}&lat=${lat}`;
      fetch(requestUrl)
        .then(function (response) {
          // request and resonse 
          return response.json();
        })
        .then(function (data) {
          storedCities = JSON.parse(localStorage.getItem("cities"));
          if (storedCities !== null) {
            cities = storedCities;
            if (!cities.includes(q)) {
              cities.push(q);
            }
          } else {
            cities.push(q);
          }
  
          localStorage.setItem("cities", JSON.stringify(cities));
          cities = [];
          loadCities();
          if (data.current.uvi <= 2) {
            uviColor = "green"
          } else if (data.current.uvi < 2 && data.current.uvi <= 5) {
            uviColor = "yellow"
          } else if (data.current.uvi < 5 && data.current.uvi <= 7) {
            uviColor ="orange"
          } else if (data.current.uvi < 7 && data.current.uvi <= 10) {
            uviColor = "red"
          } else {
            uviColor = "purple"
          };
          let currWeather = (
            `<b>${q} (${moment().format("MM/D/YYYY")})</b> <img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png"/><br />
            <b>Temp:</b> ${Math.round(data.current.temp)}&deg; F <br />
            <b>Wind:</b> ${Math.round(data.current.wind_speed)} mpg <br />
            <b>Humidity:</b> ${Math.round(data.current.humidity)} % <br />
            <b>UV Index:</b> <span class="${uviColor} text-white px-2">${data.current.uvi}</span>`
          );
          currConditionsEl.addClass('border border-dark border-2')
          // city
          
          cityNameEl.text(`${q} (${moment().format("MM/D/YYYY")})`);
          currConditionsEl.append(currWeather);
           
          // build cards to display 5-day forecast
          for (let i = 0; i < 5; i++) {
            let currDay = moment().add(i, 'days').format("MM/D/YYYY");
            let weatherBlock = $(
              `<div class="card text-white" style="width: 11rem;">
                <div class="card-body">
                <h5 class="card-title">${currDay}</h5>
                  <p class="card-text">
                    <img src="http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}.png"/> <br />
                    <b>Hi:</b> ${Math.round(data.daily[i].temp.max)}&deg; F <br />
                    <b>Low:</b> ${Math.round(data.daily[i].temp.min)}&deg; F <br />
                  </p>
                </div>
              </div>` 
            );
            // clear form
            $('input[name="city-input"]').val('');
            //append weatherBlock to Weather cards element
            weatherCardsEl.append(weatherBlock);
          };
        })
      })
      .catch(function(err) {
        let searchError;
        if (q === '') {
          searchError = $(
            `<h4 class="bg-danger text-dark">Please enter a city name.</h4>`
          )
        } else {
          searchError = $(
            `<h4 class="bg-danger text-dark">Sorry, we were unable to find, ${q}.  Please check
            the spelling and try again.</h4>`
          )
        }
        weatherCardsEl.append(searchError);
        $('input[name="city-input"]').val('');
    })
}

// click handler for input
formEl.on('submit', formHandler);

// click handler for history buttons
historyEl.on('click', function(event) {
  let q = event.target.getAttribute('data-q');
  event.stopPropagation();
  formEl.attr('data-q', q);
  formEl.submit();
})