// "use strict";

// // import * as L from "leaflet";
// // import "@geoapify/leaflet-address-search-plugin";

// const searchBox = document.querySelector(".select_city");
// const MIN_ADDRESS_LENGTH = 3;
// const DEBOUNCE_DELAY = 300;
// const inputContainerElement = document.querySelector(".input-container");
// const inputElement = document.querySelector(".input");
// const clearButton = document.querySelector(".clear-button");
// const click = document.querySelector(".click");

// const clearInputField = function () {
//   searchBox.classList.add("no_display");
// };

// function addressAutocomplete(containerElement, callback) {
//   clearButton.addEventListener("click", (e) => {
//     e.stopPropagation();
//     inputElement.value = "";
//     callback(null);
//     clearButton.classList.remove("visible");
//     closeDropDownList();
//   });

//   let currentItems;
//   /* We will call the API with a timeout to prevent unneccessary API activity.*/
//   let currentTimeout;

//   /* Save the current request promise reject function. To be able to cancel the promise when a new request comes */
//   let currentPromiseReject;

//   /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
//   let focusedItemIndex;

//   /* Process a user input: */
//   inputElement.addEventListener("input", function (e) {
//     const currentValue = this.value;

//     /* Close any already open dropdown list */
//     closeDropDownList();

//     // Cancel previous timeout
//     if (currentTimeout) {
//       clearTimeout(currentTimeout);
//     }

//     // Cancel previous request promise
//     if (currentPromiseReject) {
//       currentPromiseReject({
//         canceled: true,
//       });
//     }

//     if (!currentValue) {
//       clearButton.classList.remove("visible");
//     }

//     // Show clearButton when there is a text
//     clearButton.classList.add("visible");

//     // Skip empty or short address strings
//     if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
//       return false;
//     }

//     /* Call the Address Autocomplete API with a delay */
//     currentTimeout = setTimeout(() => {
//       currentTimeout = null;

//       /* Create a new promise and send geocoding request */
//       const promise = new Promise((resolve, reject) => {
//         currentPromiseReject = reject;

//         // The API Key provided is restricted to JSFiddle website
//         // Get your own API Key on https://myprojects.geoapify.com
//         const apiKey = "942e4e10d63d4920a2220a1161fc8e99";

//         var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
//           currentValue
//         )}&format=json&limit=5&apiKey=${apiKey}`;

//         fetch(url).then((response) => {
//           currentPromiseReject = null;

//           // check if the call was successful
//           if (response.ok) {
//             response.json().then((data) => resolve(data));
//           } else {
//             response.json().then((data) => reject(data));
//           }
//         });
//       });

//       promise.then(
//         (data) => {
//           // here we get address suggestions
//           currentItems = data.results;

//           /*create a DIV element that will contain the items (values):*/
//           const autocompleteItemsElement = document.createElement("div");
//           autocompleteItemsElement.setAttribute("class", "autocomplete-items");
//           inputContainerElement.appendChild(autocompleteItemsElement);

//           /* For each item in the results */
//           data.results.forEach((result, index) => {
//             /* Create a DIV element for each element: */
//             const itemElement = document.createElement("div");
//             /* Set formatted address as item value */
//             itemElement.innerHTML = result.formatted;
//             autocompleteItemsElement.appendChild(itemElement);

//             /* Set the value for the autocomplete text field and notify: */
//             itemElement.addEventListener("click", function (e) {
//               inputElement.value = currentItems[index].formatted;
//               callback(currentItems[index]);
//               /* Close the list of autocompleted values: */
//               closeDropDownList();
//             });
//           });
//         },
//         (err) => {
//           if (!err.canceled) {
//             console.log(err);
//           }
//         }
//       );
//     }, DEBOUNCE_DELAY);
//   });

//   /* Add support for keyboard navigation */
//   inputElement.addEventListener("keydown", function (e) {
//     let autocompleteItemsElement = containerElement.querySelector(
//       ".autocomplete-items"
//     );
//     if (autocompleteItemsElement) {
//       var itemElements = autocompleteItemsElement.getElementsByTagName("div");
//       if (e.key == "ArrowDown") {
//         e.preventDefault();
//         /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
//         focusedItemIndex =
//           focusedItemIndex !== itemElements.length - 1
//             ? focusedItemIndex + 1
//             : 0;
//         /*and and make the current item more visible:*/
//         setActive(itemElements, focusedItemIndex);
//       } else if (e.key == "ArrowUp") {
//         e.preventDefault();

//         /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
//         focusedItemIndex =
//           focusedItemIndex !== 0
//             ? focusedItemIndex - 1
//             : (focusedItemIndex = itemElements.length - 1);
//         /*and and make the current item more visible:*/
//         setActive(itemElements, focusedItemIndex);
//       } else if (e.key == "Enter") {
//         /* If the ENTER key is pressed and value as selected, close the list*/
//         e.preventDefault();
//         if (focusedItemIndex > -1) {
//           closeDropDownList();
//         }
//       }
//     } else {
//       if (e.key == "ArrowDown") {
//         /* Open dropdown list again */
//         // var event = document.createEvent("Event");
//         // event.initEvent("input", true, true);
//         // inputElement.dispatchEvent(event);

//         let event = new Event("input", { bubbles: true, cancelable: true });
//         inputElement.dispatchEvent(event);
//       }
//     }
//   });

//   function setActive(items, index) {
//     if (!items || !items.length) return false;

//     for (var i = 0; i < items.length; i++) {
//       items[i].classList.remove("autocomplete-active");
//     }

//     /* Add class "autocomplete-active" to the active element*/
//     items[index].classList.add("autocomplete-active");

//     // Change input value and notify
//     inputElement.value = currentItems[index].formatted;
//     callback(currentItems[index]);
//   }

//   function closeDropDownList() {
//     let autocompleteItemsElement = inputContainerElement.querySelector(
//       ".autocomplete-items"
//     );
//     if (autocompleteItemsElement) {
//       inputContainerElement.removeChild(autocompleteItemsElement);
//     }

//     focusedItemIndex = -1;
//   }

//   /* Close the autocomplete dropdown when the document is clicked.
//       Skip, when a user clicks on the input field */
//   document.addEventListener("click", function (e) {
//     if (e.target !== inputElement) {
//       closeDropDownList();
//     }
//   });
// }

// addressAutocomplete(
//   document.getElementById("autocomplete-container"),
//   (data) => {
//     console.log("Selected option: ");
//     console.log(data);
//   }
// );

// const cityAddress = async function () {
//   const apiKey = "942e4e10d63d4920a2220a1161fc8e99";
//   const input = inputElement.value;

//   // clearInputField();

//   if (inputElement.value !== "") {
//     const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
//       input
//     )}&apiKey=${apiKey}`;

//     const res = await fetch(geocodingUrl);

//     const data = await res.json();

//     const foundCity = data.features[0];
//     console.log(foundCity);

//     const latitude = foundCity.geometry.coordinates[1];
//     const longitude = foundCity.geometry.coordinates[0];
//     const coords = [latitude, longitude];

//     const map = L.map("map").setView(coords, 13);

//     L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     L.Control.geocoder().addTo(map);
//   }
// };

// click.addEventListener("click", function () {
//   cityAddress();
// });
