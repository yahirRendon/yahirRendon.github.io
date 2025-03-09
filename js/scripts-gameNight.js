/**
 * Game Night Score Tracker - JavaScript Functionality
 * --------------------------------------------------
 * powers the game night score tracker system, enabling users to:
 * - create, display, and update game scores
 * - toggle between views (prior games, new game, edit game, and current game).
 * - store and retrieve game data using `localStorage` for persistence.
 * - provide interactive features such as dynamic UI updates and game deletion.
 *
 * Storage & UI Interactions:
 * - usses `localStorage` to persist game data
 * - dynamically updates the UI elements based on user interactions.
 *
 */
document.addEventListener('DOMContentLoaded', function () {

  // retrieve the gameData array from localStorage or initialize as empty
  let gameData = getStoredGameData();

  // DOM element references
  const editGameWrapper = document.getElementById('edit-game');
  const priorGamesWrapper = document.getElementById('prior-games'); 
  const priorGamesContainer = document.querySelector('.prior-games-container'); 
  const buttonNewGame = document.getElementById('button-new-game'); 
  const newGamewrapper = document.getElementById('new-game-wrapper'); 
  const currentGameWrapper = document.getElementById('current-game'); 
  const navButtonWrapper = document.getElementById('nav-button-wrapper');
  const gameNameInput = document.getElementById('gameNameInput');
  const currentDateEl = document.getElementById('current-date');
  const addPlayerButton = document.getElementById('add-player-button');
  const btnSave = document.getElementById('button-save');
  const btnEdit = document.getElementById('button-edit');
  const btnBack = document.getElementById('button-back');
  const playerCardTemplate = document.getElementById('player-card-template');
  const priorGameTemplate = document.querySelector('.prior-game-template');

  /* ---------- hide/show functions ---------- */
  function hideButtonEdit() {
    btnEdit.style.display = 'none';
  }
  function showButtonEdit() {
    btnEdit.style.display = 'flex';
  }
  function hideButtonSave() {
    btnSave.style.display = 'none';
  }
  function showButtonSave() {
    btnSave.style.display = 'flex';
  }
  function hideNewGameWrapper() {
    newGamewrapper.style.display = 'none';
  }
  function showNewGameWrapper() {
    newGamewrapper.style.display = 'flex';
  }
  function hideCurrentGameWrapper() {
    currentGameWrapper.style.display = 'none';
  }
  function showCurrentGameWrapper() {
    currentGameWrapper.style.display = 'flex';
  }
  function hideNavButtonWrapper() {
    navButtonWrapper.style.display = 'none';
  }
  function showNavButtonWrapper() {
    navButtonWrapper.style.display = 'flex';
  }
  function hideEditGameWrapper() {
    editGameWrapper.style.display = 'none';
  }
  function showEditGameWrapper() {
    editGameWrapper.style.display = 'flex';
    hideNewGameWrapper();
  }
  function hidePriorGamesWrapper() {
    priorGamesWrapper.style.display = 'none';
  }
  function showPriorGamesWrapper() {
    priorGamesWrapper.style.display = 'flex';
  }

  // retrieve gameData from localStorage
  function getStoredGameData() {
    return JSON.parse(localStorage.getItem('gameData')) || [];
  }

  // simple function for check data
  function hasSavedGames() {
    const games = getStoredGameData();
    return games.length > 0;
  }

  // set the current date in the UI
  function setCurrentDate() {
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  }

  // get weather data and create mad lib
  function fetchWeatherAdLib() {
    const API_KEY = getAPIKey("048055057056057048054057051057053054056054051098052102051051051101054102099057055098100102101102");

    // Array of cities for the region with their country codes:
    const cities = [
      "Bellingham,US",
      "Sumas,US",
      "Lynden,US",
      "Ferndale,US",
      "Custer,US",
      "Abbotsford,CA",
      "Lillooet,CA",
      "Chilliwack,CA"
    ];

    // select a random city from the list.
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    // randomCity = cities[0]; // for testing

    // build the API URL
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(randomCity)}&appid=${API_KEY}`;
    console.log(Math.floor(Math.random() * cities.length), randomCity);

    // fetch weather data.
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Weather data not found");
        }
        return response.json();
      })
      .then(data => {
        if (data && data.weather && data.weather.length > 0) {
          const mainWeather = data.weather[0].main;

        //   // Log the requested city vs the returned city.
        // console.log("Requested city: " + randomCity + ", API returned city: " + data.name);
        // // Compare the requested city name (without country code) with the API returned name.
        // const requestedCityName = randomCity.split(",")[0].toLowerCase();
        // if (data.name.toLowerCase() === requestedCityName) {
        //   console.log("API returned an exact match for the requested city.");
        // } else {
        //   console.log("API returned data for the nearest city: " + data.name);
        // }

          // array of mad-lib style phrases with a placeholder for [main]
          const phrases = [
            "Even though it's [main] outside, our game night is always lit!",
            "It may be [main] out there, but in here, we're unstoppable!",
            "Who cares if it's [main]? Game night with friends beats any forecast!",
            "The weather is [main], yet our spirits are sky-high for game night!",
            "Forget the [main] weather—nothing beats our competitive game night!",
            "It's [main] outside, but our game night is pure fire!",
            "When it's [main] outside, we bring the heat on game night!",
            "If it's [main] outside, we say game night is the perfect antidote!",
            "Sure, it's [main] out there, but our game night is the real storm!",
            "The forecast says [main], but our friendship and game night always shine!",
            "I will remember this [main] day as the game night friends became enemies!",
            "Even though it's [main] outside, our friendship shines brighter -game night is a go!",
            "Even when the weather's [main], the drive home a bright after a game night victory!",
            "They say it's [main] out there, but game night is nothing but good vibes!",
            "When the weather is [main], game night and great friends are all we need!",
            "No matter if it's [main] or not, our game night is where friendship triumphs!",
            "The forecast says [main]? Please -our game night is where hopes and dreams come to die!",
            "If you don't like [main], just put all your frustration towards those winning on game night.",
            "Sure, it's [main] outside, but nothing gets in the way of our competitive parade.",
            "They say it's [main] out there, but we know our game night is too epic to be stopped.",
            "When the weather's [main], a weaker clan would cancel game night. Not us!",
            "If it's [main] outside, we consider it a challenge. We loves a fight, on and off the board!",
            "The weather might be [main], but our game night will be an all-out showdown!",
            "They say it's [main] outside, but that's just the universe testing our will to game!",
            "While others question the forecast of [main], we're busy questioning our friendship after game night.",
            "It might be [main] out there, but trust us: game night will become the storm you want to get caught in."
          ];

          // select a random phrase.
          const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
          // replace [main] with the actual weather main description.
          const finalPhrase = randomPhrase.replace("[main]", mainWeather);
          // set the resulting phrase in the element with id "weatherAdLib"
          document.getElementById("weatherAdLib").textContent = finalPhrase;
        }
      })
      .catch(error => {
        console.error("Error fetching weather:", error);
        // fallback phrase if there is an error.
        document.getElementById("weatherAdLib").textContent = "Game night always outshines the forecast!";
      });
  }

  function getAPIKey(apiKeyValue) {
    let api = "";
    for (let i = 0; i < apiKeyValue.length; i += 3) {
      let num = apiKeyValue.substring(i, i + 3);
      let char = String.fromCharCode(parseInt(num, 10));
      api += char;
    }
    return api;
  }


  // generate a random avatar URL from DiceBear
  // i like personas, minilavs, and micah
  function generateRandomAvatar() {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    return `https://api.dicebear.com/6.x/miniavs/svg?seed=${randomSeed}`;
  }

  // create a new player card using data attributes
  function createPlayerCard() {
    const clone = playerCardTemplate.content.cloneNode(true);
    const avatarImg = clone.querySelector('[data-player-image]');
    avatarImg.src = generateRandomAvatar();
    avatarImg.addEventListener('click', function () {
      avatarImg.src = generateRandomAvatar();
    });

    // attach a double-click event listener to the remove button
  const removeBtn = clone.querySelector('#remove-player-button');
  removeBtn.addEventListener('dblclick', function (e) {
    e.stopPropagation(); // Prevent propagation to any parent click events
    // Remove the entire player card element from the DOM
    const card = removeBtn.closest('.player-card');
    if (card) {
      card.remove();
    }
  });
    return clone;
  }

  // add a new player card to the edit view
  function addPlayerCard() {
    const newPlayerCard = createPlayerCard();
    const container = document.querySelector('.player-cards-container');
    // insert the new card before the first child of the container
    container.insertBefore(newPlayerCard, container.firstChild);
  }


  // gather player data from all player cards using data attributes
  function gatherPlayersData() {
    const players = [];
    const playerCards = document.querySelectorAll('.player-cards-container .player-card');
    playerCards.forEach(card => {
      const nameInput = card.querySelector('[data-player-name]');
      const scoreInput = card.querySelector('[data-player-score]');
      const avatarImg = card.querySelector('[data-player-image]');
      if (nameInput && nameInput.value.trim()) {
        const startingScore = parseInt(scoreInput.value, 10) || 0;
        players.push({
          name: nameInput.value.trim(),
          avatar: avatarImg.src,
          score: startingScore,
          scoreHistory: [startingScore]
        });
      }
    });
    return players;
  }

  // remove a game by its timestamp and refresh the display
  function removeGame(timestamp) {
    let games = getStoredGameData();
    games = games.filter(game => game.timestamp !== timestamp);
    localStorage.setItem('gameData', JSON.stringify(games));
    loadPriorGames();
    // If no games remain, hide elements but show new game button
    if (games.length === 0) {
      hidePriorGamesWrapper();
      showNewGameWrapper();
    }
  }

  // Opens the score update modal.
  // playerIndex: index of the player being updated.
  // playerName: name of the player (to be displayed in the message).
  // callback: function(delta) to call with the numeric delta once a valid number is entered.
  function openScoreUpdateModal(playerIndex, playerName, callback) {
    const modal = document.getElementById("score-update-modal");
    const modalText = document.getElementById("score-update-text");
    const inputField = document.getElementById("score-update-input");
    const submitBtn = document.getElementById("score-update-btn");

    modalText.textContent = "Update score for " + playerName;
    inputField.value = "";
    modal.style.display = "flex";

    // handler to process the input
    function handler() {
      const inputValue = inputField.value.trim();
      if (/^-?\d+(\.\d+)?$/.test(inputValue)) {
        const delta = parseFloat(inputValue);
        modal.style.display = "none";
        // Remove event listeners so they don't accumulate
        submitBtn.removeEventListener("click", handler);
        inputField.removeEventListener("keydown", keydownHandler);
        callback(delta);
      } else {
        // alert option for invalid input
        // alert("Please enter a valid number (only numeric values are allowed).");

        // If input invalid, clear the field and focus it again.
        inputField.value = "";
        inputField.focus();
      }
    }

    // listen for the enter key on the input field.
    function keydownHandler(e) {
      if (e.key === "Enter") {
        handler();
      }
    }

    // run functions on submit button or enter key
    submitBtn.addEventListener("click", handler);
    inputField.addEventListener("keydown", keydownHandler);
  }



  // load game data into the current game elements
  // game: the game data to load
  function loadGameIntoCurrentWrapper(game) {
    // sort players in descending order by score
    game.players.sort((a, b) => b.score - a.score);

    // get the current game container and store the game's timestamp as a data attribute
    const currentGame = document.getElementById('current-game');
    currentGame.setAttribute('data-timestamp', game.timestamp);

    // get game info elements and update them
    const gameNameEl = currentGame.querySelector('[data-game-name]');
    const gameDateEl = currentGame.querySelector('[data-game-date]');
    const gameWittyEl = currentGame.querySelector('[data-game-witty]');
    gameNameEl.textContent = game.gameName;
    gameDateEl.textContent = game.date;
    gameWittyEl.textContent = game.wittyText;

    // get the dedicated container for player cards
    const playerCardsContainer = currentGame.querySelector('#cur-player-cards-container');

    // clear any existing player cards
    playerCardsContainer.innerHTML = '';

    // for each player, clone the current game player card template and update its fields.
    game.players.forEach((player, index) => {
      const clone = document.getElementById('cur-player-card-template').content.cloneNode(true);
      const avatarImg = clone.querySelector('[data-player-image]');
      const playerNameEl = clone.querySelector('[data-player-name]');
      const playerScoreEl = clone.querySelector('[data-player-score]');

      avatarImg.src = player.avatar;
      playerNameEl.textContent = player.name;
      playerScoreEl.textContent = player.score;

      // make the score element interactive for updating the score via the modal
      playerScoreEl.style.cursor = 'pointer';
      playerScoreEl.addEventListener('click', function () {
        openScoreUpdateModal(index, player.name, function (delta) {
          // get the current game's timestamp from the DOM
          const timestamp = currentGame.getAttribute('data-timestamp');
          let games = getStoredGameData();
          const gameIndex = games.findIndex(g => g.timestamp === timestamp);
          if (gameIndex !== -1) {
            // update the score and score history for the specific player
            games[gameIndex].players[index].score += delta;
            games[gameIndex].players[index].scoreHistory.push(games[gameIndex].players[index].score);

            // re-sort players after updating the score
            games[gameIndex].players.sort((a, b) => b.score - a.score);

            // save the updated games array back to local storage
            localStorage.setItem('gameData', JSON.stringify(games));

            // reload the current game view with the updated game
            loadGameIntoCurrentWrapper(games[gameIndex]);
          }
        });
      });

      // append cloned card to player card container
      playerCardsContainer.appendChild(clone);
    });

    // ensure appropriate UI elements appear
    showCurrentGameWrapper();
    showNavButtonWrapper();
    hideButtonSave();
    showButtonEdit();
    showButtonEdit();
  }

  // save the game data into localStorage and load it into display view
  function saveGameData() {
    // validate that the game name is not empty. return focus if empty
    if (!gameNameInput.value.trim()) {
      gameNameInput.focus();
      return;
    }

    const players = gatherPlayersData();
    const now = new Date();
    const wittyText = document.getElementById("weatherAdLib").textContent;

    // retrieve any existing timestamp from the edit view
    const existingTimestamp = editGameWrapper.getAttribute("data-timestamp");
    let gameEntry;
    let games = getStoredGameData();

    if (existingTimestamp) {
      // update an existing game
      gameEntry = {
        gameName: gameNameInput.value.trim(),
        date: now.toLocaleString(), 
        timestamp: existingTimestamp, 
        wittyText: wittyText,
        players: players
      };

      // find the existing game and update it
      const index = games.findIndex(g => g.timestamp === existingTimestamp);
      if (index !== -1) {
        games[index] = gameEntry;
      } else {
        // should not happen, but if not found, add as new.
        games.push(gameEntry);
      }
    } else {
      // save as a new game
      gameEntry = {
        gameName: gameNameInput.value.trim(),
        date: now.toLocaleString(),
        timestamp: now.toISOString(),
        wittyText: wittyText,
        players: players
      };
      games.push(gameEntry);
    }

    // update localStorage with the games array
    localStorage.setItem('gameData', JSON.stringify(games));

    // clear the edit fields
    gameNameInput.value = '';
    document.querySelector('.player-cards-container').innerHTML = '';

    // alert game successful option
    // alert('Game saved successfully!');

    // ensure apprioriate UI elements appear
    hideEditGameWrapper();
    hidePriorGamesWrapper();
    hideNewGameWrapper();
    showNavButtonWrapper();

    // load the saved (or updated) game into the current game view
    loadGameIntoCurrentWrapper(gameEntry);
  }

  // load and display prior games from localStorage
  function loadPriorGames() {
    const games = getStoredGameData();
    priorGamesContainer.innerHTML = '';
    games.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    games.forEach(game => {
      let winner = 'N/A';
      if (game.players && game.players.length > 0) {
        const maxScore = Math.max(...game.players.map(player => player.score));
        const winners = game.players.filter(player => player.score === maxScore);
        if (winners.length === 1) {
          winner = winners[0].name;
        } else if (winners.length > 1) {
          winner = "TBD!";
        }
      }
      const clone = priorGameTemplate.content.cloneNode(true);
      clone.querySelector('[data-game-name]').textContent = game.gameName;
      clone.querySelector('[data-game-date]').textContent = game.date;
      clone.querySelector('[data-game-winner]').textContent = "WINNER: " + winner;

      // get the remove button and stop its event propagation
      const removeButton = clone.querySelector('#button-remove');
      removeButton.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      removeButton.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        removeGame(game.timestamp);
      });

      // attach click event to the prior game tile, but not on the remove button.
      const gameCardElement = clone.querySelector('.prior-game-item');
      gameCardElement.addEventListener('click', function () {
        hidePriorGamesWrapper();
        hideNewGameWrapper();
        loadGameIntoCurrentWrapper(game);
      });

      priorGamesContainer.appendChild(clone);
    });
  }


  // attach listeners for the edit game functionality
  function attachEditGameListeners() {
    addPlayerButton.addEventListener('click', addPlayerCard);
    btnBack.addEventListener('click', function () {
      hideEditGameWrapper();
      hideNavButtonWrapper();
      hideCurrentGameWrapper();
      if (hasSavedGames()) {
        showPriorGamesWrapper();
        loadPriorGames();
      }
      showNewGameWrapper();
    });
    btnSave.addEventListener('click', saveGameData);
  }

  // attach listener for the new game button
  function attachNewGameListener() {
    if (buttonNewGame) {
      buttonNewGame.addEventListener('click', function () {
        hideButtonEdit();
        hidePriorGamesWrapper();
        hideCurrentGameWrapper();
        fetchWeatherAdLib();
        showButtonSave();
        showEditGameWrapper();
        showNavButtonWrapper();

      });
    }
  }

  // loads the current game data into the edit game view.
  // game: game data to load
  function loadGameIntoEditView(game) {
    const editGame = document.getElementById('edit-game');

    // load game name into the input field.
    const gameNameInput = document.getElementById('gameNameInput');
    gameNameInput.value = game.gameName;

    // load game date.
    const currentDateEl = document.getElementById('current-date');
    currentDateEl.textContent = game.date;

    // load witty comment.
    const weatherAdLib = document.getElementById('weatherAdLib');
    weatherAdLib.textContent = game.wittyText;

    // clear the container for player cards in the edit view.
    const container = document.querySelector('.player-cards-container');
    container.innerHTML = "";

    // for each player, clone the player card template and populate the inputs.
    game.players.forEach(player => {
      const clone = document.getElementById('player-card-template').content.cloneNode(true);
      const nameInput = clone.querySelector('[data-player-name]');
      const scoreInput = clone.querySelector('[data-player-score]');
      const avatarImg = clone.querySelector('[data-player-image]');

      nameInput.value = player.name;
      scoreInput.value = player.score;
      avatarImg.src = player.avatar;

      // add click listener so user can get a new random avatar.
      avatarImg.addEventListener('click', function () {
        avatarImg.src = generateRandomAvatar();
      });

      // attach remove player functionality
      const removeBtn = clone.querySelector('#remove-player-button');
      removeBtn.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        // Remove the card from the edit container.
        const card = removeBtn.closest('.player-card');
        if (card) {
          card.remove();
        }
      });

      container.appendChild(clone);
    });

    // store the game's timestamp in the edit view for later updating.
    editGame.setAttribute('data-timestamp', game.timestamp);
  }


  // switches from current game view to edit mode by loading the current game data.
  function switchToEditMode() {
    const currentGame = document.getElementById('current-game');
    const timestamp = currentGame.getAttribute('data-timestamp');
    if (!timestamp) {
      //   alert("No current game loaded.");
      return;
    }

    const games = getStoredGameData();
    const game = games.find(g => g.timestamp === timestamp);
    if (!game) {
      //   alert("Game not found.");
      return;
    }

    // hide the current game view and show the edit view.
    hideCurrentGameWrapper();
    showEditGameWrapper();

    // load the current game data into the edit view.
    loadGameIntoEditView(game);

    // ensure corret UI elements appear
    hideButtonEdit();
    showButtonSave();
  }

  // attach event listener for the Edit button so that clicking it switches to edit mode.
  btnEdit.addEventListener('click', switchToEditMode);


  // initialize the view on page load:
  // ensure correct UI elements appear
  function initializeView() {
    gameData = getStoredGameData();
    if (gameData.length > 0) {
      showPriorGamesWrapper();
      hideEditGameWrapper();
      hideNavButtonWrapper();
      loadPriorGames();
      hideCurrentGameWrapper();
    } else {
      hideNavButtonWrapper();
      hideEditGameWrapper();
      hideEditGameWrapper();
      hidePriorGamesWrapper();
    }
  }

  // set the current date
  setCurrentDate();
  // attach event listeners
  attachEditGameListeners();
  attachNewGameListener();
  // initialize the view based on localStorage data
  initializeView();
});
