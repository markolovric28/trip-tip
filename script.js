"use strict";

// import L from "leaflet";
// import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// const provider = new OpenStreetMapProvider();

// const searchControl = new GeoSearchControl({
//   provider: provider,
// });
const searchBox = document.querySelector(".select_city");
const MIN_ADDRESS_LENGTH = 3;
const DEBOUNCE_DELAY = 300;
const inputContainerElement = document.querySelector(".input_container");
const inputElement = document.querySelector(".input");
const clearButton = document.querySelector(".clear_button");
const click = document.querySelector(".click");

let map;
let coordsMap;
let routeMarker = [];
let placeID = "";

let rows = "";
let marker = [];

let namesAtt = [];
let coordsResults = [];

class Map {
  #map;

  constructor() {
    this.addressAutocomplete(
      document.getElementById("autocomplete_container"),
      (data) => {
        console.log("Selected option: ");
        console.log(data);
      }
    );
  }

  clearInputField() {
    searchBox.classList.add("no_display");
  }

  async cityAddress() {
    try {
      const apiKey = "942e4e10d63d4920a2220a1161fc8e99";
      const input = inputElement.value;
      let form;

      if (!input) return alert("Address is invalid! Please try again.");

      if (inputElement.value !== "") {
        const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          input
        )}&apiKey=${apiKey}`;

        const res = await fetch(geocodingUrl);

        const data = await res.json();

        console.log(data);

        placeID = data.features[0].properties.place_id;
        console.log(placeID);

        const foundCity = data.features[0];
        console.log(foundCity);

        const latitude = foundCity.geometry.coordinates[1];
        const longitude = foundCity.geometry.coordinates[0];
        const coords = [latitude, longitude];
        coordsMap = coords;

        console.log(coordsMap);

        map = L.map("map").setView(coords, 13);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
      }

      this.clearInputField();

      form = new Form();
    } catch (err) {
      return alert(`There is something wrong: ${err}`);
    }
  }

  addressAutocomplete(containerElement, callback) {
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      inputElement.value = "";
      callback(null);
      clearButton.classList.remove("visible");
      closeDropDownList();
    });

    let currentItems;
    let currentTimeout;
    let currentPromiseReject;
    let focusedItemIndex;

    inputElement.addEventListener("input", function (e) {
      const currentValue = this.value;

      closeDropDownList();

      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }

      if (currentPromiseReject) {
        currentPromiseReject({
          canceled: true,
        });
      }

      if (!currentValue) {
        clearButton.classList.remove("visible");
      }

      clearButton.classList.add("visible");

      if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
        return false;
      }

      currentTimeout = setTimeout(() => {
        currentTimeout = null;

        const promise = new Promise((resolve, reject) => {
          currentPromiseReject = reject;
          const apiKey = "942e4e10d63d4920a2220a1161fc8e99";

          var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            currentValue
          )}&format=json&limit=5&apiKey=${apiKey}`;

          fetch(url).then((response) => {
            currentPromiseReject = null;

            if (response.ok) {
              response.json().then((data) => resolve(data));
            } else {
              response.json().then((data) => reject(data));
            }
          });
        });

        promise.then(
          (data) => {
            currentItems = data.results;

            const autocompleteItemsElement = document.createElement("div");
            autocompleteItemsElement.setAttribute(
              "class",
              "autocomplete_items"
            );
            inputContainerElement.appendChild(autocompleteItemsElement);

            data.results.forEach((result, index) => {
              const itemElement = document.createElement("div");
              itemElement.innerHTML = result.formatted;
              autocompleteItemsElement.appendChild(itemElement);

              itemElement.addEventListener("click", function (e) {
                inputElement.value = currentItems[index].formatted;
                callback(currentItems[index]);
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

    inputElement.addEventListener("keydown", function (e) {
      let autocompleteItemsElement = containerElement.querySelector(
        ".autocomplete_items"
      );
      if (autocompleteItemsElement) {
        var itemElements = autocompleteItemsElement.getElementsByTagName("div");
        if (e.key == "ArrowDown") {
          e.preventDefault();

          focusedItemIndex =
            focusedItemIndex !== itemElements.length - 1
              ? focusedItemIndex + 1
              : 0;

          setActive(itemElements, focusedItemIndex);
        } else if (e.key == "ArrowUp") {
          e.preventDefault();

          focusedItemIndex =
            focusedItemIndex !== 0
              ? focusedItemIndex - 1
              : (focusedItemIndex = itemElements.length - 1);

          setActive(itemElements, focusedItemIndex);
        } else if (e.key == "Enter") {
          e.preventDefault();
          if (focusedItemIndex > -1) {
            closeDropDownList();
          }
        }
      } else {
        if (e.key == "ArrowDown") {
          let event = new Event("input", { bubbles: true, cancelable: true });
          inputElement.dispatchEvent(event);
        }
      }
    });

    function setActive(items, index) {
      if (!items || !items.length) return false;

      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("autocomplete_active");
      }
      items[index].classList.add("autocomplete_active");

      inputElement.value = currentItems[index].formatted;
      callback(currentItems[index]);
    }

    function closeDropDownList() {
      let autocompleteItemsElement = inputContainerElement.querySelector(
        ".autocomplete_items"
      );
      if (autocompleteItemsElement) {
        inputContainerElement.removeChild(autocompleteItemsElement);
      }

      focusedItemIndex = -1;
    }
    document.addEventListener("click", function (e) {
      if (e.target !== inputElement) {
        closeDropDownList();
      }
    });

    click.addEventListener("click", () => this.cityAddress());
  }
}

const mapField = new Map();

// SIDEBAR
const formTitle = document.querySelector(".form__title");
const form = document.querySelector(".grid__main");
const formContainer = document.querySelector(".main__input-container");
const iconForward = document.querySelector(".forward");
const iconBack = document.querySelector(".back");
const btnForm = document.querySelector(".form__btn");

// MAIN CONTAINER
const inputMain = document.getElementById("main__input");

// SELECTION CONTAINER
const attText = document.querySelector(".att__text");
const attractionsType = document.querySelector(".attractions__type");
const attractionsFee = document.querySelector(".attractions__fee");
const attractionsProximity = document.querySelector(".attractions__proximity");

const resText = document.querySelector(".res__text");
const restaurantsType = document.querySelector(".restaurants__type");
const restaurantsCuisine = document.querySelector(".restaurants__cuisine");
const restaurantsProximity = document.querySelector(".restaurants__proximity");

// RESULTS CONTAINER
const resultsContainer = document.querySelector(".results__container");
const resultsButtonBack = document.querySelector(".btn__back");
const resultsButtonRoute = document.querySelector(".btn__route");
const resultsList = document.querySelector(".results__list");

class Form {
  constructor() {
    formTitle.classList.remove("no_display");
    form.classList.remove("no_display");
    form.style.background = "#fff";
    formContainer.classList.remove("no_display");

    iconForward.addEventListener("click", () => this.renderForm());

    document.addEventListener("click", (e) => {
      if (e.target.id === "back") {
        this.changeForm();
      }
    });

    resultsButtonBack.addEventListener("click", () => this.resetForm());
    btnForm.addEventListener("click", () => this.newTrip());
  }

  changeForm() {
    formContainer.classList.remove("no_display");
    form.classList.remove(
      "form__grid",
      "form__attractions",
      "form__restaurants"
    );
    form.classList.add("grid__main");
    btnForm.classList.add("no_display");

    inputMain.value =
      attractionsType.value =
      attractionsFee.value =
      attractionsProximity.value =
      restaurantsType.value =
      restaurantsCuisine.value =
      restaurantsProximity.value =
        "";

    if (!attText.classList.contains("no_display")) {
      attText.classList.add("no_display");
    }

    if (!resText.classList.contains("no_display")) {
      resText.classList.add("no_display");
    }

    form.style.height = "16rem";
  }

  renderForm() {
    let input = inputMain.value;
    if (inputMain.value === "") return alert("Please select the category!");
    console.log(input);

    formContainer.classList.add("no_display");
    form.classList.remove("grid__main");
    btnForm.classList.remove("no_display");
    form.style.height = "19rem";

    if (input === "attractions") {
      attText.classList.remove("no_display");
      form.classList.add("form__grid", "form__attractions");
    }

    if (input === "restaurants") {
      resText.classList.remove("no_display");
      form.classList.add("form__grid", "form__restaurants");
    }
  }

  newTrip() {
    let trip;

    let input = inputMain.value;

    if (input === "attractions") {
      const typeA = attractionsType.value;
      const fee = attractionsFee.value;
      const proximityA = attractionsProximity.value;

      // guard clause
      if (!typeA || !fee || !proximityA)
        return alert("Fill out all fields completely!");

      trip = new Attractions(typeA, fee, proximityA);
    }

    if (input === "restaurants") {
      const typeR = restaurantsType.value;
      const cuisine = restaurantsCuisine.value;
      const proximityR = restaurantsProximity.value;

      // guard clause
      if (!typeR || !cuisine || !proximityR)
        return alert("Fill out all fields completely!");

      trip = new Restaurants(typeR, cuisine, proximityR);
    }

    btnForm.classList.add("no_display");

    if (!attText.classList.contains("no_display")) {
      attText.classList.add("no_display");
    }

    if (!resText.classList.contains("no_display")) {
      resText.classList.add("no_display");
    }

    form.style.background = "#d7e4c0";
    form.style.height = 0;

    resultsContainer.classList.remove("no_display");
  }

  resetForm() {
    resultsContainer.classList.add("no_display");

    namesAtt.length = 0;
    resultsList.innerHTML = "";
    rows = "";
    console.log(namesAtt);

    btnForm.classList.remove("no_display");

    form.style.background = "#fff";
    form.style.height = "16rem";

    for (let i = 0; i < marker.length; i++) {
      map.removeLayer(marker[i]);
    }

    for (let i = 0; i < routeMarker.length; i++) {
      map.removeLayer(routeMarker[i]);
    }

    this.changeForm();
  }
}

class Results {
  parentElement = document.querySelector(".results__list");
  apiKey = "942e4e10d63d4920a2220a1161fc8e99";

  constructor(type, proximity) {
    this.type = type;
    this.proximity = proximity;
  }

  renderMarker(res1, res2, res3) {
    let resMarker = L.marker([res1, res2])
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 150,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`${res3}`)
      .openPopup();

    marker.push(resMarker);
  }

  // SPINNER
  renderSpinner() {
    const markup = `
  <div class="spinner">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm37.25,58.75a8,8,0,0,0,5.66-2.35l22.63-22.62a8,8,0,0,0-11.32-11.32L167.6,77.09a8,8,0,0,0,5.65,13.66ZM224,120H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z"></path></svg>
  </div>
  `;
    this.parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  clear() {
    this.parentElement.innerHTML = "";
  }
}

class Attractions extends Results {
  constructor(type, fee, proximity) {
    super(type, proximity);
    this.fee = fee;

    this.renderAttractions();
    resultsButtonRoute.addEventListener("click", () =>
      this.makeRoute(coordsResults)
    );
  }

  async renderAttractions() {
    try {
      if (resultsButtonRoute.classList.contains("no_display")) {
        resultsButtonRoute.classList.remove("no_display");
      }
      const type = this.type;
      const fee = this.fee;
      const proximity = this.proximity;

      this.renderSpinner();

      const attrRender = `https://api.geoapify.com/v2/places?categories=${type}&conditions=${fee}&filter=circle:${coordsMap[1]},${coordsMap[0]},5000&bias=proximity:${coordsMap[1]},${coordsMap[0]}&lang=en&limit=10&apiKey=${this.apiKey}
    `;

      const res = await fetch(attrRender);

      const data = await res.json();

      console.log(data);

      const features = data.features;

      this.clear();

      features.forEach((res) => {
        rows += `
      <li class="results__item">
        <div class="results__photo-container"></div>
        <div class="results__data">
          <h4 class="results__name">${res.properties.address_line1}</h4>
          <div class="data__flex">
            <a href="${res.properties.website}" class="results__webpage">${
          res.properties.website ? res.properties.website : ""
        }</a>
          </div>
        </div>
      </li>`;

        namesAtt.push(res.properties.address_line1 + ` ${res.properties.city}`);
        coordsResults.push([
          res.geometry.coordinates[1],
          res.geometry.coordinates[0],
        ]);

        this.renderMarker(
          res.geometry.coordinates[1],
          res.geometry.coordinates[0],
          res.properties.address_line1
        );
      });

      this.renderImages();

      this.parentElement.insertAdjacentHTML("afterbegin", rows);
    } catch (err) {
      console.log(err);
    }
  }

  async renderImages() {
    try {
      for (let i = 0; i < namesAtt.length; i++) {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${namesAtt[i]}&per_page=1`,
          {
            headers: {
              Authorization:
                "gN5njtKJDuEC2dyznBOpN4i5u2jHzw2mOIoWAUEkmgOwd0r9fry2yrAj",
            },
          }
        );

        const data = await res.json();

        this.getPhoto(data.photos);
      }
    } catch (err) {
      return alert(`There is something wrong: ${err}`);
    }
  }

  getPhoto(images) {
    images.map((image) => {
      let imgTag = `<img src=${image.src.tiny} class="results__photo" alt="text" />`;
      document
        .querySelector(".results__photo-container")
        .insertAdjacentHTML("beforeend", imgTag);
    });
  }

  async makeRoute(coords) {
    // try {
    const turnByTurnMarkerStyle = {
      radius: 5,
      fillColor: "#fff",
      color: "#555",
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
    };

    const routeRender = `https://api.geoapify.com/v1/routing?waypoints=${coords.join(
      "|"
    )}&mode=walk&apiKey=${this.apiKey}`;

    // console.log(coords.join("|"));

    const res = await fetch(routeRender);

    const data = await res.json();

    console.log(data);

    let routeA = L.geoJSON(data, {
      style: (feature) => {
        return {
          color: "rgba(255, 20, 20)",
          weight: 5,
        };
      },
    })
      .bindPopup((layer) => {
        return `${layer.feature.properties.distance} ${layer.feature.properties.distance_units}, ${layer.feature.properties.time}`;
      })
      .addTo(map);

    // collect all transition positions
    const turnByTurns = [];
    data.features.forEach((feature) =>
      feature.properties.legs.forEach((leg, legIndex) =>
        leg.steps.forEach((step) => {
          const pointFeature = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates:
                feature.geometry.coordinates[legIndex][step.from_index],
            },
            properties: {
              instruction: step.instruction.text,
            },
          };
          turnByTurns.push(pointFeature);
        })
      )
    );

    let routeB = L.geoJSON(
      {
        type: "FeatureCollection",
        features: turnByTurns,
      },
      {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, turnByTurnMarkerStyle);
        },
      }
    )
      .bindPopup((layer) => {
        return `${layer.feature.properties.instruction}`;
      })
      .addTo(map);

    routeMarker.push(routeA, routeB);
    // } catch (err) {
    //   // return alert(`There is something wrong: ${err}`);
    //   console.log(err);
    // }
  }
}

class Restaurants extends Results {
  constructor(type, cuisine, proximity) {
    super(type, proximity);
    this.cuisine = cuisine;

    this.renderRestaurants();
  }

  async renderRestaurants() {
    try {
      resultsButtonRoute.classList.add("no_display");

      const cuisine = this.cuisine;
      const type = this.type;
      const proximity = this.proximity;

      this.renderSpinner();

      if (type === cuisine) {
        const restRender1 = `https://api.geoapify.com/v2/places?categories=${cuisine}&filter=circle:${coordsMap[1]},${coordsMap[0]},5000&bias=proximity:${coordsMap[1]},${coordsMap[0]}&limit=20&apiKey=${this.apiKey}
    `;

        const res = await fetch(restRender1);

        const data = await res.json();

        this.renderResults(data);
      } else {
        const restRender = `https://api.geoapify.com/v2/places?categories=${cuisine}&conditions=${
          type === "catering.restaurant" ? "named" : type
        }&filter=circle:${coordsMap[1]},${coordsMap[0]},5000&bias=proximity:${
          coordsMap[1]
        },${coordsMap[0]}&limit=20&apiKey=${this.apiKey}
    `;

        const res = await fetch(restRender);

        const data = await res.json();

        this.renderResults(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  renderResults(data) {
    const features = data.features;

    this.clear();

    features.forEach((res) => {
      rows += `
          <ul class="results__list">
            <li class="results__item">
              <div class="results__data-restaurants">
                <h4 class="results__name">${res.properties.address_line1}</h4>
                <div class="data__flex">
                  <p>Outdoor seating: ${
                    res.properties.facilities?.outdoor_seating === true
                      ? "Yes"
                      : "No"
                  }</p>
                  <a href="${
                    res.properties.website
                  }" class="results__webpage">${
        res.properties.website ? res.properties.website : ""
      }</a>
                </div>
              </div>
            </li>
          </ul>`;

      namesAtt.push(res.properties.address_line1 + ` ${res.properties.city}`);

      this.renderMarker(
        res.geometry.coordinates[1],
        res.geometry.coordinates[0],
        res.properties.address_line1
      );
    });

    this.parentElement.insertAdjacentHTML("afterbegin", rows);
  }
}
