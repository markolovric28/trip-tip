"use strict";

// import L from "leaflet";
// import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// const provider = new OpenStreetMapProvider();

// const searchControl = new GeoSearchControl({
//   provider: provider,
// });

const searchBox = document.querySelector(".select_city");

// const inputContainer = document.querySelector(".form");
// const inputDiv = document.querySelector(".select_city_form_container");
// const inputEl = document.querySelector(".select_city_form");

// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

//       const coords = [latitude, longitude];

//       const map = L.map("map").setView(coords, 13);

//       L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);
//     },
//     function () {
//       alert("Could not get your position");
//     }
//   );

const clearInputField = function () {
  searchBox.classList.add("no_display");
};

const cityAddress = function (input) {
  const address = input;
  console.log(address);
  const apiKey = "942e4e10d63d4920a2220a1161fc8e99";

  clearInputField();

  if (!address) {
    console.log("The city you were looking for does not exist");
    return;
  }

  const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    address
  )}&apiKey=${apiKey}`;

  fetch(geocodingUrl)
    .then((result) => result.json())
    .then(
      (featureCollection) => {
        console.log(featureCollection);
        const foundCity = featureCollection.features[0];
        console.log(foundCity.properties.city);

        const latitude = foundCity.geometry.coordinates[1];
        const longitude = foundCity.geometry.coordinates[0];
        const coords = [latitude, longitude];
        console.log(coords);

        const map = L.map("map").setView(coords, 13);

        L.tileLayer(
          `https://tile.openstreetmap.org/{z}/{x}/{y}.png?apiKey=${apiKey}`,
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(map);

        // map.addControl(searchControl);
      },
      function () {
        alert("Could not get your position");
      }
    );
};

function addressAutocomplete(containerElement, callback, options) {
  const MIN_ADDRESS_LENGTH = 3;
  const DEBOUNCE_DELAY = 300;

  // create container for input element
  const inputContainerElement = document.createElement("div");
  inputContainerElement.setAttribute("class", "input-container");
  containerElement.appendChild(inputContainerElement);

  // create input element
  const inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("placeholder", options.placeholder);
  inputContainerElement.appendChild(inputElement);

  // add input field clear button
  const clearButton = document.createElement("div");
  clearButton.classList.add("clear-button");
  addIcon(clearButton);
  clearButton.addEventListener("click", (e) => {
    e.stopPropagation();
    inputElement.value = "";
    callback(null);
    clearButton.classList.remove("visible");
    closeDropDownList();
  });
  inputContainerElement.appendChild(clearButton);

  let currentItems;
  /* We will call the API with a timeout to prevent unneccessary API activity.*/
  let currentTimeout;

  /* Save the current request promise reject function. To be able to cancel the promise when a new request comes */
  let currentPromiseReject;

  /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
  let focusedItemIndex;

  /* Process a user input: */
  inputElement.addEventListener("input", function () {
    const currentValue = this.value;

    /* Close any already open dropdown list */
    closeDropDownList();

    // Cancel previous timeout
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    // Cancel previous request promise
    if (currentPromiseReject) {
      currentPromiseReject({
        canceled: true,
      });
    }

    if (!currentValue) {
      clearButton.classList.remove("visible");
    }

    // Show clearButton when there is a text
    clearButton.classList.add("visible");

    // Skip empty or short address strings
    if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
      return false;
    }

    /* Call the Address Autocomplete API with a delay */
    currentTimeout = setTimeout(() => {
      currentTimeout = null;

      /* Create a new promise and send geocoding request */
      const promise = new Promise((resolve, reject) => {
        currentPromiseReject = reject;

        const apiKey = "942e4e10d63d4920a2220a1161fc8e99";

        var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          currentValue
        )}&format=json&limit=5&apiKey=${apiKey}`;

        fetch(url).then((response) => {
          currentPromiseReject = null;

          // check if the call was successful
          // if (response.ok) {
          //   response.json().then((data) => resolve(data));
          // } else {
          //   response.json().then((data) => reject(data));
          // }
          response.ok
            ? response.json().then((data) => resolve(data))
            : response.json().then((data) => reject(data));
        });
      });

      promise.then(
        (data) => {
          // here we get address suggestions
          currentItems = data.results;

          /* create a DIV element that will contain the items (values): */
          const autocompleteItemsElement = document.createElement("div");
          autocompleteItemsElement.setAttribute("class", "autocomplete-items");
          inputContainerElement.appendChild(autocompleteItemsElement);

          /* For each item in the results */
          data.results.forEach((result, index) => {
            /* Create a DIV element for each element: */
            const itemElement = document.createElement("div");
            /* Set formatted address as item value */
            itemElement.innerHTML = result.formatted;
            autocompleteItemsElement.appendChild(itemElement);

            /* Set the value for the autocomplete text field and notify: */
            itemElement.addEventListener("click", function () {
              inputElement.value = currentItems[index].formatted;
              cityAddress(inputElement.value);
              callback(currentItems[index]);
              /* Close the list of autocompleted values: */
              closeDropDownList();
            });
          });
        },
        (err) => {
          if (!err.canceled) {
            console.log(err);
          }
        }
      );
    }, DEBOUNCE_DELAY);
  });

  /* Add support for keyboard navigation */
  inputElement.addEventListener("keydown", function (e) {
    let autocompleteItemsElement = containerElement.querySelector(
      ".autocomplete-items"
    );
    if (autocompleteItemsElement) {
      let itemElements = autocompleteItemsElement.getElementsByTagName("div");
      if (e.key == "ArrowDown") {
        e.preventDefault();
        /*If the arrow DOWN Code is pressed, increase the focusedItemIndex variable:*/
        focusedItemIndex =
          focusedItemIndex !== itemElements.length - 1
            ? focusedItemIndex + 1
            : 0;
        /* and make the current item more visible:*/
        setActive(itemElements, focusedItemIndex);
      } else if (e.key == "ArrowUp") {
        e.preventDefault();

        /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
        focusedItemIndex =
          focusedItemIndex !== 0
            ? focusedItemIndex - 1
            : (focusedItemIndex = itemElements.length - 1);
        /*and and make the current item more visible:*/
        setActive(itemElements, focusedItemIndex);
      } else if (e.key == "Enter") {
        /* If the ENTER key is pressed and value as selected, close the list*/
        e.preventDefault();
        if (focusedItemIndex > -1) {
          cityAddress(inputElement.value);
          closeDropDownList();
        }
      }
    } else {
      if (e.key == "ArrowDown") {
        /* Open dropdown list again */
        // var event = document.createEvent("Event");
        // event.initEvent("input", true, true);
        // inputElement.dispatchEvent(event);

        let event = new Event("input", { bubbles: true, cancelable: true });
        inputElement.dispatchEvent(event);
      }
    }
  });

  function setActive(items, index) {
    if (!items || !items.length) return false;

    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("autocomplete-active");
    }

    /* Add class "autocomplete-active" to the active element*/
    items[index].classList.add("autocomplete-active");

    // Change input value and notify
    inputElement.value = currentItems[index].formatted;
    callback(currentItems[index]);
  }

  function closeDropDownList() {
    const autocompleteItemsElement = inputContainerElement.querySelector(
      ".autocomplete-items"
    );
    if (autocompleteItemsElement) {
      inputContainerElement.removeChild(autocompleteItemsElement);
    }

    focusedItemIndex = -1;
  }

  function addIcon(buttonElement) {
    const svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgElement.setAttribute("viewBox", "0 0 24 24");
    svgElement.setAttribute("height", "24");

    const iconElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    iconElement.setAttribute(
      "d",
      "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    );
    iconElement.setAttribute("fill", "currentColor");
    svgElement.appendChild(iconElement);
    buttonElement.appendChild(svgElement);
  }

  /* Close the autocomplete dropdown when the document is clicked. 
    Skip, when a user clicks on the input field */
  document.addEventListener("click", function (e) {
    if (e.target !== inputElement) {
      closeDropDownList();
    } else if (!containerElement.querySelector(".autocomplete-items")) {
      // open dropdown list again
      // var event = document.createEvent("Event");
      // event.initEvent("input", true, true);
      // inputElement.dispatchEvent(event);

      let event = new Event("input", { bubbles: true, cancelable: true });
      inputElement.dispatchEvent(event);
    }
  });
}

addressAutocomplete(
  document.getElementById("autocomplete-container"),
  (data) => {
    console.log("Selected option: ");
    console.log(data);
  },
  {
    placeholder: "Enter an address here",
  }
);

// SPINNER
// renderSpinner() {
//   const markup = `
//   <div class="spinner">
//     <svg>
//       <use href="${icons}#icon-loader"></use>
//      </svg>
//   </div>
//   `;
//   this._clear();
//   this._parentElement.insertAdjacentHTML('afterbegin', markup);
// }

// _clear() {
//   this._parentElement.innerHTML = '';
// }
