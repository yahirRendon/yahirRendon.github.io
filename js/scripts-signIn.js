/**
 * Event Management System - JavaScript Functionality
 * --------------------------------------------------
 * powers the event management system, enabling users to:
 * - create, display, and manage events.
 * - sign in guests and track event attendance.
 * - toggle between event views (guest list, event creation, prior events).
 * - store and retrieve event data using `localStorage` for persistence.
 * - provide interactive features such as smooth scrolling, dynamic UI updates, and event deletion.
 *
 * Core Functionalities:
 * - `createNewEvent(event)`: Creates and stores a new event.
 * - `addGuestToCurrentEvent(event)`: Adds a guest to the currently loaded event.
 * - `displayEvents()`: Loads and displays all saved events.
 * - `displayGuests()`: Updates the guest list for the active event.
 * - `loadMostRecentEvent()`: Automatically loads the most recent event on page load.
 * - `deleteEvent(timestamp)`: Deletes an event and updates the UI.
 * - `togglePaidStatus(eventTimestamp, guestIndex)`: Toggles the paid status of a guest.
 * - `updateEventBackground(imageIndex)`: Updates the background image dynamically.
 * - `tripleClickGuests()`: Detects rapid triple-click interactions for toggling UI elements.
 *
 * Storage & UI Interactions:
 * - sses `localStorage` to persist events and guest lists.
 * - dynamically updates the UI elements based on user interactions.
 * - implements smooth scrolling and visual feedback.
 *
 */

// UI buttons
const viewGuestsButton = document.getElementById("view-guests-btn");
const viewCreateButton = document.getElementById("view-create-btn");
const deleteAllGuestsButton = document.getElementById("delete-all-btn");
const scrollToTopButton = document.getElementById("scroll-to-top-btn");
const copyGuestsButton = document.getElementById("copy-guests-btn");

// current event elements
const currEventElems = document.getElementById("current-event");
const CurrentformContainer = document.querySelector(".current-form-container");
const hostNameElem = document.getElementById("host-name-title");
const eventNameElem = document.getElementById("event-name-title");
const eventDateElem = document.getElementById("event-date-title");

// create event elements
const createEventElems = document.getElementById("create-event");
const createEventForm = document.getElementById('create-event-form');
const guestSignInForm = document.getElementById('guest-sign-in-form');

// guest elements
const guestListContainer = document.getElementById("guestList");
const guestTemplate = document.getElementById("guest-template");
const guestInfoElements = document.getElementById("guest-wrapper");
const totalGuestsElement = document.getElementById("total-guests");
const guestsPaidElement = document.getElementById("guests-paid");
const totalKidsElement = document.getElementById("total-kids");
const heardMeetupElement = document.getElementById("heard-meetup");
const heardEventbriteElement = document.getElementById("heard-eventbrite");
const heardFlyerElement = document.getElementById("heard-flyer");
const heardChurchElement = document.getElementById("heard-church");
const heardOtherElement = document.getElementById("heard-other");
const heardNotSpecifiedElement = document.getElementById("heard-not-specified");

// prior event elements
const priorEventContainer = document.getElementById("priorEventList");
const priorEventTemplate = document.getElementById("prior-event-template");
const priorEventElements = document.getElementById("prior-events-wrapper");

// track clicks for triple click
var clickCount = 0;
var lastClickTime = 0;
var imageIndex = 0;

// path to images
// const imgPath = "img/projects/signIn/";
const imgPath = "../img/projects/signIn/";
// hold names for images. access via index
const imgNames = [
  "pexels-ella-olsson-572949-1640777.jpg",
  "pavel-kalenik-Ql_SWytd1C4-unsplash.JPG",
  "pexels-lum3n-44775-1028599.jpg",
  "pexels-tijana-drndarski-449691-1145977.jpg",
  "pexels-ella-olsson-572949-1640773.jpg",
  "nadine-primeau-l5Mjl9qH8VU-unsplash.jpg",
  "pexels-ella-olsson-572949-1640770.jpg",
  "pexels-adonyi-foto-1414651.jpg",
  "marisol-benitez-QvkAQTNj4zk-unsplash.jpg",
  "lindsay-moe-n-QvF3vyf5M-unsplash.jpg",
  "mariana-medvedeva-fk6IiypMWss-unsplash.jpg",
  "brooke-lark-HlNcigvUi4Q-unsplash.jpg",
  "julia-zolotova-M_xIaxQE3Ms-unsplash.jpg",
  "edward-howell-ub68KKvNYsY-unsplash.jpg",
  "gonzalo-mendiola-dzn37nOmki4-unsplash.jpg",
  "edward-howell-ub68KKvNYsY-unsplash.jpg",
  "pexels-cottonbro-3927387.jpg",
  "pexels-goumbik-669578.jpg"
]

/**
 * initializes the event management system when the DOM is fully loaded.
 *
 * @event DOMContentLoaded - fires when the DOM has fully loaded.
 * @modifies localStorage - reads event and guest data but does not modify them.
 * @modifies DOM - dynamically updates UI elements based on event and guest data.
 * @fires loadMostRecentEvent - loads the latest event and updates the UI.
 * @fires displayGuests - refreshes the guest list when applicable.
 * @fires displayEvents - updates the event list when toggling views.
 * @calls tripleClickGuests - detects triple-click interactions to toggle views.
 * @listens submit:createEventForm - calls `createNewEvent()` when a new event is submitted.
 * @listens submit:guestSignInForm - calls `addGuestToCurrentEvent()` when a new guest signs in.
 */
document.addEventListener("DOMContentLoaded", function () {

  guestSignInForm.reset();
  createEventForm.reset();

  // set background image to index 0 by default
  updateEventBackground(0);

  // check for and load the most recent event data
  loadMostRecentEvent();

  // toggle showing/hiding guest list for current events on tripple click
  viewGuestsButton.addEventListener("click", function () {
    // get event data from localStorage
    const allEvents = JSON.parse(localStorage.getItem('eventData')) || {};

    // check if any events exist and display guests for 
    // current event when toggled else hide guests
    if (tripleClickGuests()) {
      if (Object.keys(allEvents).length) { // If events exist
        displayGuests();
        displayEvents();
        guestInfoElements.style.display = "flex";
        currEventElems.style.display = "block";
        createEventElems.style.display = "none";
        priorEventElements.style.display = "none";
      }
    } else {
      guestInfoElements.style.display = "none";
    }
  }, false);

  // toggle showing/hiding create event on tripple click
  viewCreateButton.addEventListener("click", function () {

    // display events and create event
    if (tripleClickGuests()) {
      currEventElems.style.display = "none";
      createEventElems.style.display = "block";
      guestInfoElements.style.display = "none";
      priorEventElements.style.display = "flex";
      displayEvents();
    } else {
      // get event data from local storage
      const allEvents = JSON.parse(localStorage.getItem('eventData')) || {};
      // if events exist display them else keep hiding prior events
      if (Object.keys(allEvents).length) { // If events exist
        currEventElems.style.display = "block";
        createEventElems.style.display = "none";
      }
      priorEventElements.style.display = "none";
    }
  }, false);

  // call displayGuests on page load or when event changes
  displayGuests();

  // call when new event is submitted
  createEventForm.addEventListener('submit', createNewEvent);

  // call when new guest is submitted
  guestSignInForm.addEventListener('submit', addGuestToCurrentEvent);
});

/**
 * loads the most recent event from localStorage and updates the UI accordingly.
 *
 * - retrieves all stored events from localStorage
 * - if non exist hide the current event display and shows the event creation form
 * - else finds the most recent event based on the highest timestamp (newest)
 * - updates the UI elements with the most recent event's data
 *
 * @function loadMostRecentEvent
 * @modifies localStorage - reads stored events but does not modify them.
 * @modifies DOM - updates UI elements to reflect the most recent event.
 * @calls updateEventBackground - changes the event background dynamically.
 */
const loadMostRecentEvent = () => {
  // get eventData from localStorage
  const allEvents = JSON.parse(localStorage.getItem('eventData')) || {};

  // check if any events exist
  if (Object.keys(allEvents).length === 0) {
    // console.log("no events here")
    // hide current event elements and only display the create event elements
    currEventElems.style.display = "none";
    createEventElems.style.display = "block";

    // exit function if no events found
    return;
  }

  // console.log("Events found here");

  // if events exits find the most recent event
  const mostRecentTimestamp = Math.max(...Object.keys(allEvents).map(Number));
  const mostRecentEvent = allEvents[mostRecentTimestamp];

  // update the UI with the most recent event's data
  hostNameElem.textContent = mostRecentEvent.hostName;
  eventNameElem.textContent = mostRecentEvent.eventName;
  eventDateElem.textContent = mostRecentEvent.eventDate;
  updateEventBackground(mostRecentEvent.imageIndex);

  // show current event elements and hide create event elements
  currEventElems.style.display = "block";
  createEventElems.style.display = "none";
};

/**
 * creates a new event, stores it in localStorage, updates the UI, and displays a confirmation message
 *
 * - triggered when the event creation form is submitted
 * - retrieves input values, validates them, and generates a unique timestamp for the new event
 * - the event is saved in localStorage under its timestamp as the key
 * - the UI is updated to display the new event, and a **temporary confirmation message** is shown
 *
``
 *
 * @function createNewEvent
 * @param {Event} event - the form submission event
 * @modifies localStorage - stores the newly created event
 * @modifies DOM - updates UI elements to reflect the new event
 * @calls updateEventBackground - updates the event background based on the selected image
 */
const createNewEvent = (event) => {
  // prevent the form from refreshing the page
  event.preventDefault();

   // get the input field values
   const hostNameInput = document.getElementById('host-name-field');
   const eventNameInput = document.getElementById('event-name-field');
   const eventDateInput = document.getElementById('event-date-field');
   const imageIndexInput = document.getElementById('event-image-field');

   const hostName = hostNameInput.value.trim();
   const eventName = eventNameInput.value.trim();
   const eventDate = eventDateInput.value.trim();
   const imageIndex = parseInt(imageIndexInput.value.trim(), 10);

   // validate inputs and set focus to missing field
   if (!hostName) {
    hostNameInput.focus();
       return;
   }
   if (!eventName) {
    eventNameInput.focus();
       return;
   }
   if (!eventDate) {
    eventDateInput.focus();
       return;
   }
   if (isNaN(imageIndex)) {
    imageIndexInput.focus();
       return;
   }

  // generate a unique timestamp for the event
  const timestamp = new Date().getTime();

  // create the new event object
  const newEvent = {
    hostName,
    eventName,
    eventDate,
    imageIndex,
    guests: [], // Initialize an empty array for guests
  };

  // check if eventData exists in localStorage
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // save the new event using the timestamp as the key
  eventData[timestamp] = newEvent;

  // save the updated eventData back to localStorage
  localStorage.setItem('eventData', JSON.stringify(eventData));

  // update the UI with the new event data
  hostNameElem.textContent = newEvent.hostName;
  eventNameElem.textContent = newEvent.eventName;
  eventDateElem.textContent = newEvent.eventDate;
  updateEventBackground(newEvent.imageIndex);

  // make sure the current event elements are visible
  currEventElems.style.display = "block";
  createEventElems.style.display = "none";

  createEventForm.reset();

  priorEventElements.style.display = "none";

  // use welcome message to show created message
  const welcomeMessage = document.createElement("div");
  welcomeMessage.className = "welcome-message";
  welcomeMessage.textContent = `created!`;
  CurrentformContainer.classList.add("hide");
  CurrentformContainer.parentElement.appendChild(welcomeMessage);

  // hide the welcome message and restore the form after 3 seconds
  setTimeout(() => {
    welcomeMessage.remove();
    CurrentformContainer.classList.remove("hide");
  }, 3000);

  // console.log('New event added:', newEvent);
};

/**
 * updates the background image of the currently displayed event based on the provided image index
 *
 * - create background image URL using `imgPath` and `imgNames[imageIndex]`
 * - set the image as a CSS background
 *
 * @function updateEventBackground
 * @param {number} imageIndex - the index of the image in the `imgNames` array
 * @modifies DOM - changes the CSS background of the event container
 */

const updateEventBackground = (imageIndex) => {
  const eventContainerImage = document.getElementsByClassName("current-event-container")[0];
  eventContainerImage.style.background = "url(" + imgPath + imgNames[imageIndex] + ") no-repeat center center/cover";
};

/**
 * cycle through background image based on the user's selected image index.
 *
 * - listens for user input in the `event-image-field` input field.
 * - updates the background
 * - if input field is invalid or not found, defaults to `imageIndex = 0`.
 *
 * @event input - fires when the user types in the `event-image-field` input.
 * @param {Event} e - the input event object.
 * @modifies DOM - dynamically updates the background image of the event preview.
 * @calls updateEventBackground - changes the background image in real-time.
 */
document.getElementById('event-image-field').addEventListener('input', (e) => {
  // get input
  const imageIndex = parseInt(e.target.value.trim(), 10);

  // check if the image index is valid
  if (!isNaN(imageIndex) && imgNames[imageIndex]) {
    updateEventBackground(imageIndex);
  } else {
    updateEventBackground(0);
  }
});

/**
 * adds a new guest to the currently displayed event and updates the guest list in localStorage
 *
 * - retrieves input values from the sign-in form and validates that first name and last name are provided
 * - Creates a guest object  with default values if necessary
 * - finds the currently displayed event  using `hostNameElem` and `eventNameElem` and matches it with `eventData`
 * - if a matching event is found:
 *   - new guest is added to the beginning of the guest list
 *   - the updated data is stored back into localStorage
 *   - the UI is refreshed
 *   - a temporary welcome message is displayed for 3 seconds replacing the sign-in form
 * - if no matching event is found, the function exits without adding a guest
 *
 * @function addGuestToCurrentEvent
 * @param {Event} event - the form submission event
 * @modifies localStorage - updates the guest list of the currently displayed event
 * @fires displayGuests - refreshes the UI after adding a guest
 * @modifies DOM - updates form input fields, hides the form temporarily, and displays a welcome message
 */
const addGuestToCurrentEvent = (event) => {
  // prevent form submission default behavior
  event.preventDefault();

  // get the input fields
  const firstNameInput = document.querySelector('.current-sign-in-form input[placeholder="First Name"]');
  const lastNameInput = document.querySelector('.current-sign-in-form input[placeholder="Last Name"]');
  const emailInput = document.querySelector('.current-sign-in-form input[placeholder="Email Address"]');
  const dropdownInput = document.querySelector('.current-sign-in-form .dropdown');

  // get values from the form
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const heardAbout = dropdownInput.value;

  // validate first and last name
  if (!firstName || !lastName) {
    if (!firstName) {
      firstNameInput.focus();
    } else if (!lastName) {
      lastNameInput.focus();
    }
    return;
  }

  // create a guest object
  const newGuest = {
    firstName,
    lastName,
    email: email || null, // if empty, store as null
    paid: "no", // default to "no"
    kids: 0, // default to 0
    heardAbout: heardAbout || null, // if empty, store as null
  };

  // get eventData from localStorage
  const eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // find the currently displayed event by its timestamp
  const currentEventTimestamp = Object.keys(eventData).find((timestamp) => {
    const currentHost = hostNameElem.textContent.trim();
    const currentEventName = eventNameElem.textContent.trim();
    const event = eventData[timestamp];
    return event.hostName === currentHost && event.eventName === currentEventName;
  });

  // if event exists...
  if (currentEventTimestamp) {
    // add the guest to the guests array of the current event
    eventData[currentEventTimestamp].guests.unshift(newGuest);

    // save the updated eventData back to Local Storage
    localStorage.setItem('eventData', JSON.stringify(eventData));
    // console.log('Guest added:', newGuest);

    // clear the form fields after successful submission
    firstNameInput.value = '';
    lastNameInput.value = '';
    emailInput.value = '';
    dropdownInput.value = '';

    guestSignInForm.reset();

    // refresh UI
    displayGuests();

    // show welcome message
    const welcomeMessage = document.createElement("div");
    welcomeMessage.className = "welcome-message";
    welcomeMessage.textContent = `Welcome, ${firstName}!`;
    CurrentformContainer.classList.add("hide");
    CurrentformContainer.parentElement.appendChild(welcomeMessage);

    // hide the welcome message and restore the form after 3 seconds
    setTimeout(() => {
      welcomeMessage.remove();
      CurrentformContainer.classList.remove("hide");
    }, 3000);

    // alert('Guest added successfully!');
  } else {
    // alert('No currently displayed event found to add the guest.');
  }
};

/**
 * retrieves and displays a list of prior events, allowing users to load or delete events
 *
 * - retrieves event data from localStorage populates the event list
 * - events are sorted with newest first
 * - events are created as a UI element using a template and added to the `priorEventContainer`
 * - clicking an event loads it into the current event section
 * - double-clicking the delete button removes an event
 * 
 * @function displayEvents
 * @modifies DOM - updates the prior event list in the UI.
 * @modifies localStorage - reads event data but does not modify it directly.
 * @fires loadEventAsCurrent - loads a selected event when clicked.
 * @fires deleteEventAndHandleNext - deletes an event and handles loading the next one.
 */
const displayEvents = () => {
  // get eventData from localStorage
  const eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // get or create prior event container
  if (!priorEventContainer) {
    priorEventContainer = document.createElement('div');
    priorEventContainer.id = "prior-events-container";
    document.body.appendChild(priorEventContainer);
  }

  // clear previous events
  priorEventContainer.innerHTML = "";

  // exit if there are no events
  const eventTimestamps = Object.keys(eventData);
  if (eventTimestamps.length === 0) {
    priorEventContainer.textContent = "No prior events found.";
    return;
  }

  // sort timestamps in descending order (newest first)
  const sortedTimestamps = eventTimestamps.sort((a, b) => b - a);

  // loop through the sorted timestamps and display the events
  sortedTimestamps.forEach((timestamp, index) => {
    const event = eventData[timestamp];

    // clone the template
    const eventElement = priorEventTemplate.content.cloneNode(true);

    // populate the event data
    eventElement.querySelector('[data-event-data]').textContent = event.eventDate;
    eventElement.querySelector('[data-host-name]').textContent = event.hostName;
    eventElement.querySelector('[data-event-name]').textContent = event.eventName;
    eventElement.querySelector('[data-num-guests]').textContent = event.guests.length;
    eventElement.querySelector('[data-event-img]').style.background = "url(" + imgPath + imgNames[event.imageIndex] + ") no-repeat center center/cover";

    // add click event listener to delete this event
    eventElement.querySelector('.delete-event-button').addEventListener('dblclick', (e) => {
      e.stopPropagation(); // Prevent the parent click event from firing
      deleteEventAndHandleNext(timestamp, sortedTimestamps, index);
    });

    // add a click event listener to load this event into the current event section
    // load the event when clicking anywhere else in the event item
    const eventItem = eventElement.querySelector('.prior-event-item');
    eventItem.addEventListener('click', (e) => {
      if (!e.target.classList.contains('delete-event-button')) { // Prevent loading when clicking the delete button
        loadEventAsCurrent(timestamp, true);
        currEventElems.style.display = "block";
        createEventElems.style.display = "none";
      }
    });

    // append the event to the container
    priorEventContainer.appendChild(eventElement);
  });
};

/**
 * deletes an event and automatically loads the next available event, or resets the UI if no events remain
 *
 * - removes the specified event from localStorag` and updates the stored event data.
 * - after deletion, it refreshes the event list in the UI by calling `displayEvents()`
 * - find the next available event to display
 * - if no events remain, the UI switches to event creation mode
 *
 * @function deleteEventAndHandleNext
 * @param {string} timestamp - the unique identifier (timestamp) of the event to delete
 * @param {string[]} sortedTimestamps - an array of event timestamps sorted in descending order
 * @param {number} index - the index of the event being deleted within `sortedTimestamps`
 * @modifies localStorage - removes the specified event and updates the stored event data
 * @fires displayEvents - refreshes the event list in the UI after deletion
 * @calls loadEventAsCurrent - loads the next available event if one exists
 * @modifies DOM - updates UI elements to either display the next event or reset to event creation mode
 */
const deleteEventAndHandleNext = (timestamp, sortedTimestamps, index) => {
  // load eventData from localStorage
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // delete the event from storage
  delete eventData[timestamp];

  // save the updated eventData back to Local Storage
  localStorage.setItem('eventData', JSON.stringify(eventData));

  // refresh the displayed events
  displayEvents();

  // find the next available event
  const nextEventTimestamp = sortedTimestamps[index + 1] || sortedTimestamps[index - 1];

  // handle nevet event display
  if (nextEventTimestamp && eventData[nextEventTimestamp]) {
    loadEventAsCurrent(nextEventTimestamp, false);
    // currEventElems.style.display = "block";
    // createEventElems.style.display = "none";
  } else {
    // no events left, hide the current event section and show create event form
    currEventElems.style.display = "none";
    createEventElems.style.display = "block";
    priorEventElements.style.display = "none"
  }
};

/**
 * loads an event as the currently displayed event in the UI and updates event-related elements
 *
 * - retrieves event data from localStorage using the provided timestamp
 * - if the event exists, it updates the UI elements (`hostNameElem`, `eventNameElem`, `eventDateElem`)
 * - updates the event background image using `updateEventBackground()`
 *
 * @function loadEventAsCurrent
 * @param {string} timestamp - the unique identifier (timestamp) of the event to load.
 * @param {boolean} collapse - if `true`, hides the prior event list after loading the event.
 * @modifies DOM - updates the UI elements to reflect the loaded event.
 * @calls updateEventBackground - updates the background based on the event's image index.
 */
const loadEventAsCurrent = (timestamp, collapse) => {
  // get eventDate from local storage
  const eventData = JSON.parse(localStorage.getItem('eventData')) || {};
  const currentEvent = eventData[timestamp];

  if (currentEvent) {
    // update the currently displayed event UI
    hostNameElem.textContent = currentEvent.hostName;
    eventNameElem.textContent = currentEvent.eventName;
    eventDateElem.textContent = currentEvent.eventDate;
    updateEventBackground(currentEvent.imageIndex);

    // hide prior events if deisred
    if (collapse) {
      priorEventElements.style.display = "none";
    }

    // console.log(`Event "${currentEvent.eventName}" is now the currently displayed event.`);
  } else {
    // alert('Unable to load the event.');
  }
};

/**
 * deletes a specified event from localStorage and refreshes the event list in the UI
 *
 * - retrieves event data from localStorage and looks up the event by its timestamp
 * - removes event from `eventData`and updates data is saved back to localStorage
 * - `displayEvents()` is called to refresh the event list in the UI
 *
 * **Behavior:**
 * - (Optional) if confirmation is required before deleting event, uncomment the `confirm()` prompt
 *
 * @function deleteEvent
 * @param {string} timestamp - the unique identifier (timestamp) of the event to delete.
 * @modifies localStorage - removes the specified event from storage.
 * @fires displayEvents - updates the event list in the UI after deletion.
 */
const deleteEvent = (timestamp) => {
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // confirm deletion
  // const eventName = eventData[timestamp]?.eventName || "this event";
  // const confirmed = confirm(`Are you sure you want to delete "${eventName}"?`);
  // if (!confirmed) return;

  // delete the event
  delete eventData[timestamp];

  // save the updated data back to localStorage
  localStorage.setItem('eventData', JSON.stringify(eventData));

  // refresh the events list
  displayEvents();

  // console.log(`Event "${eventName}" has been deleted.`);
};

/**
 * displays the guest list for the currently loaded event and updates event statistics.
 *
 * - retrieves event data from localStorage and finds the event that matches the 
 *   currently displayed `hostNameElem` and `eventNameElem`.
 * - clears the existing guest list and repopulates it with the guests from the event.
 * - tracks event statistics and updates in the UI.
 * - event actions for marking guest as "Paid", updating the number of kids, or removing a guest 
 *   are handled via interactive buttons.
 *
 * **Statistics Tracked:**
 * - `totalGuests`: total guests in the event.
 * - `guestsPaid`: count of guests who have paid.
 * - `totalKids`: sum of all kids brought by guests.
 * - `heardMeetup`, `heardEventbrite`, `heardFlyer`, `heardChurch`, `heardOther`, `heardNotSpecified`
 *   : count of guests based on how they heard about the event.
 *
 * **Event Listeners:**
 * - clicking the "Paid" button updates the paid status and refreshes the UI.
 * - clicking the "Kids" button updates the kids count and refreshes the UI.
 * - double-clicking the "Remove" button removes the guest and refreshes the UI.
 *
 * @function displayGuests
 * @fires displayGuests - refreshes the UI when guests are modified.
 * @modifies localStorage - reads event data to display, but does not modify it directly.
 */

const displayGuests = () => {
  // retrieve eventData from local storage
  const eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // exit if no events exist
  if (Object.keys(eventData).length === 0) {
    // console.log("No events found in Local Storage.");
    return;
  }

  // find the currently displayed event
  const currentHost = hostNameElem.textContent.trim();
  const currentEventName = eventNameElem.textContent.trim();

  const currentEventTimestamp = Object.keys(eventData).find((timestamp) => {
    const event = eventData[timestamp];
    return event.hostName === currentHost && event.eventName === currentEventName;
  });

  // xxit if no matching current event is found
  if (!currentEventTimestamp) {
    // console.log("No current event found.");
    return;
  }

  // pass eventData for event to local var 
  const currentEvent = eventData[currentEventTimestamp];

  // get the template and the container where guests will be displayed
  if (!guestListContainer) {
    guestListContainer = document.createElement('div');
    guestListContainer.id = 'guest-container';
    document.body.appendChild(guestListContainer);
  }

  // Clear previous guest list
  guestListContainer.innerHTML = "";

  // initialize statistics tracking variables 
  let totalGuests = 0;
  let guestsPaid = 0;
  let totalKids = 0;
  let heardMeetup = 0;
  let heardEventbrite = 0;
  let heardFlyer = 0;
  let heardChurch = 0;
  let heardOther = 0;
  let heardNotSpecified = 0;

  // loop through the guests and display them
  currentEvent.guests.forEach((guest, index) => {
    totalGuests++; // increment total guest count
    if (guest.paid === "yes") guestsPaid++; // count guests who have paid
    totalKids += guest.kids || 0; // count total kids

    // track how the guest heard about the event
    switch (guest.heardAbout) {
      case "meetup":
        heardMeetup++;
        break;
      case "eventbrite":
        heardEventbrite++;
        break;
      case "flyer":
        heardFlyer++;
        break;
      case "church":
        heardChurch++;
        break;
      case "other":
        heardOther++;
        break;
      default:
        heardNotSpecified++;
        break;
    }

    // clone the template
    const guestElement = guestTemplate.content.cloneNode(true);

    // populate the guest data
    guestElement.querySelector('[data-name]').textContent = `${guest.firstName} ${guest.lastName}`;
    guestElement.querySelector('[data-email]').textContent = guest.email || "N/A";
    guestElement.querySelector('[data-heard-about]').textContent = guest.heardAbout || "N/A";

    // toggle paid button and refresh UI
    const paidBtn = guestElement.querySelector('[data-paid]');
    paidBtn.textContent = guest.paid === "yes" ? "Yes" : "No";
    paidBtn.addEventListener("click", () => {
      togglePaidStatus(currentEventTimestamp, index);
      displayGuests();
    });

    // increment kids button and refresh UI
    const kidsBtn = guestElement.querySelector('[data-kids]');
    kidsBtn.textContent = guest.kids || 0;
    kidsBtn.addEventListener("click", () => {
      toggleKidsCount(currentEventTimestamp, index);
      displayGuests();
    });

    // remove individual guest when double clicked
    guestElement.querySelector('.remove-guest-btn').addEventListener("dblclick", () => {
      removeGuest(currentEventTimestamp, index);
      displayGuests(); // Refresh UI after removal
    });

    // append the guest to the container
    guestListContainer.appendChild(guestElement);
  });

  // update statestics in UI
  totalGuestsElement.textContent = totalGuests;
  guestsPaidElement.textContent = guestsPaid;
  totalKidsElement.textContent = totalKids;
  heardMeetupElement.textContent = heardMeetup;
  heardEventbriteElement.textContent = heardEventbrite;
  heardFlyerElement.textContent = heardFlyer;
  heardChurchElement.textContent = heardChurch;
  heardOtherElement.textContent = heardOther;
  heardNotSpecifiedElement.textContent = heardNotSpecified;
};

/**
 * toggles the paid button associated with a guest and updates the guest list.
 *
 * - retrieves event data from Local Storage and identifies the guest within the specified event
 * - toggles the guest's paid button to yes or no
 * - the updated event data is saved back to Local Storage to maintain persistence
 * - `displayGuests()` is called to refresh the UI and reflect the change
 *
 * @function togglePaidStatus
 * @param {string} eventTimestamp - the unique timestamp identifier for the event
 * @param {number} guestIndex - the index of the guest in the event's guest list
 * @modifies localStorage - updates the event data by modifying the guest's paid status
 * @fires displayGuests - refreshes the UI to reflect the updated guest list
 */
const togglePaidStatus = (eventTimestamp, guestIndex) => {
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  if (eventData[eventTimestamp]) {
    const guest = eventData[eventTimestamp].guests[guestIndex];
    guest.paid = guest.paid === "yes" ? "no" : "yes";

    localStorage.setItem('eventData', JSON.stringify(eventData));
    displayGuests(); // Refresh guest list
  }
};

/**
 * increments the number of kids associated with a guest and updates the guest list.
 *
 * - retrieves event data from localStorage and identifies the guest within the specified event
 * - the guest's `kids` count is incremented between 0 and 5 using the modulo operator
 * - the updated event data is saved back to localStorage to maintain persistence
 * - `displayGuests()` is called to refresh the UI and reflect the change
 *
 * @function toggleKidsCount
 * @param {string} eventTimestamp - the unique timestamp identifier for the event
 * @param {number} guestIndex - the index of the guest in the event's guest list
 * @modifies localStorage - updates the event data by modifying the guest's `kids` count
 * @fires displayGuests - refreshes the UI to reflect the updated guest list
 */
const toggleKidsCount = (eventTimestamp, guestIndex) => {
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  if (eventData[eventTimestamp]) {
    const guest = eventData[eventTimestamp].guests[guestIndex];
    guest.kids = (guest.kids + 1) % 6; // Cycle through 0-5 kids

    localStorage.setItem('eventData', JSON.stringify(eventData));
    displayGuests(); // Refresh guest list
  }
};

/**
 * removes a specific guest from an event and updates the guest list in localStorage
 *
 * - retrieve the event data from localStorage and finds the event by its timestamp.
 * - if the event exists, the specified guest is removed
 * - the updated event data is saved back to localStorage
 * - `displayGuests()` is called to refresh the UI with the updated guest list
 *
 * @function removeGuest
 * @param {string} eventTimestamp - the unique timestamp identifier for the event.
 * @param {number} guestIndex - the index of the guest in the event's guest list.
 * @modifies localStorage - ppdates the event data by removing the specified guest.
 * @fires displayGuests - refreshes the UI to reflect the updated guest list.
 */
const removeGuest = (eventTimestamp, guestIndex) => {
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // remove guests
  if (eventData[eventTimestamp]) {
    eventData[eventTimestamp].guests.splice(guestIndex, 1);

    // set localStorage and refresh guest list
    localStorage.setItem('eventData', JSON.stringify(eventData));
    displayGuests();
  }
};

/**
 * attach a double-click event listener to the `deleteAllGuestsButton`, 
 * triggering the deletion of all guests from the currently displayed event
 *
 * - when **double-clicked** the button, `deleteAllGuestsFromCurrentEvent()` is executed
 * - This ensures that all guests from the currently loaded event are removed

 *
 * **Behavior:**
 * - requires a **double-click** (`dblclick`) to prevent accidental deletions.
 *
 * @event dblclick - triggers deletion of all guests from the current event.
 * @fires deleteAllGuestsFromCurrentEvent - executes the guest deletion process.
 */
deleteAllGuestsButton.addEventListener("dblclick", () => {
  deleteAllGuestsFromCurrentEvent();
});

/**
 * deletes all guests from the currently loaded event while keeping the event itself intact.
 *
 * - finds the currently displayed event by matching `hostNameElem` and `eventNameElem` to stored event data.
 * - if a matching event is found, it removes all guests
 * - The updated event data is saved back to `localStorage`
 * - `displayGuests()` is called to refresh the UI and reflect the changes.
 *
 * - (Optional) If confirmation is required before deleting guests, uncomment the `confirm()` prompt.
 *
 * @function deleteAllGuestsFromCurrentEvent
 * @fires displayGuests - updates the guest list in the UI after deletion.
 * @modifies localStorage - updates the currently loaded event's guest list.
 */

const deleteAllGuestsFromCurrentEvent = () => {
  // get eventData from localStorage
  let eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // find the currently displayed event using host, event, and time stamp
  const currentHost = hostNameElem.textContent.trim();
  const currentEventName = eventNameElem.textContent.trim();
  const currentEventTimestamp = Object.keys(eventData).find((timestamp) => {
    const event = eventData[timestamp];
    return event.hostName === currentHost && event.eventName === currentEventName;
  });

  // exit if no event found
  if (!currentEventTimestamp) {
    // alert("No current event found.");
    return;
  }

  // Optional: Confirm deletion before proceeding
  // const confirmation = confirm("Are you sure you want to delete all guests for this event?");
  // if (!confirmation) return;

  // set the guests array to an empty list
  eventData[currentEventTimestamp].guests = [];

  // save the updated eventData back to Local Storage
  localStorage.setItem('eventData', JSON.stringify(eventData));

  // refresh the guest list display
  displayGuests();
};

/**
 * copies the current event guest data to the clipboard in a CSV style format
 *
 * - when the user clicks the current event data is collected
 * - if none is found the function exists
 * - guest data is set to string in CSV style formatting and copied to clipboard
 *
 * @event click - triggers copying of guest data
 */
copyGuestsButton.addEventListener("click", () => {
  // retrieve eventData from Local Storage
  const eventData = JSON.parse(localStorage.getItem('eventData')) || {};

  // find the currently displayed event using host, event, and time stamp
  const currentHost = hostNameElem.textContent.trim();
  const currentEventName = eventNameElem.textContent.trim();
  const currentEventTimestamp = Object.keys(eventData).find((timestamp) => {
    const event = eventData[timestamp];
    return event.hostName === currentHost && event.eventName === currentEventName;
  });

  // exit if no matching current event is found
  if (!currentEventTimestamp) {
    // alert("No current event found.");
    return;
  }

  // set the eventData to local variable
  const currentEvent = eventData[currentEventTimestamp];

  // exit if there are no guests
  if (!currentEvent.guests.length) {
    // alert("No guests to export.");
    return;
  }

  // define CSV headers
  let csvContent = "first_name,last_name,email,paid,kids,heard_about\n";

  // loop through guests and add their data to the CSV string
  currentEvent.guests.forEach((guest) => {
    let row = [
      `${guest.firstName}`,
      `${guest.lastName}`,
      `${guest.email || ""}`,
      `${guest.paid}`,
      `${guest.kids || 0}`,
      `${guest.heardAbout || "unknown"}`
    ].join(",");

    csvContent += row + "\n";
  });

  // copy info to clipboard with status cue
  navigator.clipboard.writeText(csvContent)
    .then(() => showCopyStatus("success"))
    .catch(() => showCopyStatus("error"));
});

/**
 * updates the copy button icon to provide visual feedback on the copy operation.
 *
 * When called:
 * - Changes the Font Awesome icon inside the copy button to indicate success or failure
 * - Temporarily changes the icon color (green for success, red for failure).
 * - Reverts the icon back to the original copy icon after 1.5 seconds.
 *
 * @param {string} status - The status of the copy operation. Expected values: "success" or "error".
 */
const showCopyStatus = (status) => {
  // gett the Font Awesome icon within the copy button
  const copyButtonIcon = document.querySelector("#copy-guests-btn i");

  // exit the function if icon not found
  if (!copyButtonIcon) return;

  // set the icon and color based on the status
  if (status === "success") {
    // change to checkmark and change icon color to green for success
    copyButtonIcon.classList.replace("fa-copy", "fa-check");
    copyButtonIcon.style.color = "green";
  } else {
    // change to X and change icon color to red for failure
    copyButtonIcon.classList.replace("fa-copy", "fa-times");
    copyButtonIcon.style.color = "red";
  }

  // revert the icon back to copy after 1.5 seconds
  setTimeout(() => {
    copyButtonIcon.classList.replace("fa-check", "fa-copy"); // reset success icon
    copyButtonIcon.classList.replace("fa-times", "fa-copy"); // reset error icon
    copyButtonIcon.style.color = ""; // reset icon color to default
  }, 1500);
};

/**
 * smoothly scrolls the user to the top of the page and hides the `guestInfoElements` once scrolling completes.
 *
 * - when the user clicks the scroll-to-top button, the page smoothly scrolls to the top.
 * - while scrolling, an event listener monitors the window’s scroll position.
 * - once the page reaches the top (`window.scrollY === 0`), the `guestInfoElements` is hidden.
 * - the scroll event listener is removed after execution to prevent unnecessary checks.
 *
 * @event click - triggers the scroll-to-top action.
 */
scrollToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });

  // listen and hide guest info on scroll completion
  const checkIfAtTop = () => {
    if (window.scrollY === 0) {
      guestInfoElements.style.display = "none";
      window.removeEventListener("scroll", checkIfAtTop); // Remove event listener after execution
    }
  };

  window.addEventListener("scroll", checkIfAtTop);
});

/**
 * detects if the user clicks three times within a short time interval (200ms per click).
 *
 * - track the timestamps of button clicks and counts how many occur within **200 milliseconds**.
 * - if three consecutive clicks happen within this timeframe, the function returns `true` (valid triple click).
 * - if the time between clicks exceeds 200ms, the counter resets.
 *
 * @function tripleClickGuests
 * @returns {boolean} `true` if the user clicks three times within 200ms intervals, otherwise `false`.
 */
function tripleClickGuests() {
  const currentTime = new Date().getTime();
  let validClicks = false;

  // check if the time difference between this click and the last one is within 200ms
  if (currentTime - lastClickTime <= 200) {
    clickCount++;
  } else {
    // reset if the interval is greater than 200ms
    clickCount = 1;
  }

  // if the button has been clicked 3 times within 200ms intervals
  if (clickCount === 3) {
    validClicks = true;
    clickCount = 0;
  }
  // update the last click time
  lastClickTime = currentTime;
  return validClicks;
}



