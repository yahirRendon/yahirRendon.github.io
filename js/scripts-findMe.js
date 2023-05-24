//=============================================================================
// scripts page for for find me game
//=============================================================================
const menuButton = document.getElementById('menu-button');
const topButton = document.getElementById('top-button');
const difficultyButton = document.getElementById('button-p5-1');
const resetGameButton = document.getElementById('button-p5-3');

/******************************************************************************
*
* run when window loads
* 
*****************************************************************************/
window.onload = function () {
    // may want to use this in the future
    // for p5.projects to inform user to visit website via pc
    // if(isMobile.any) {
    //     document.getElementById("s1-header").textContent = "Not Mobile"
    // }
}

/******************************************************************************
*
* simple way to check if page arrived at by
* back button. reset nav to default
* 
*****************************************************************************/
window.onpageshow = function (event) {
    if (event.persisted) {
        // window.location.reload();
        resetMenu();
    }
};

/******************************************************************************
*
* Toggle elements when menu-button clicked in navigation 
* 
*****************************************************************************/
menuButton.addEventListener('click', function () {
    navigationBarToggle();
    toggleHamIcon();
});

/******************************************************************************
*
* Toggle the menu links in navigation
* 
*****************************************************************************/
function navigationBarToggle() {
    // toggle nav menu based given current display state
    let navElem = document.getElementsByClassName('nav-links');
    for (var i = 0; i < navElem.length; i++) {
        let navStyle = window.getComputedStyle(navElem[i], null);
        let navStyleDisplay = navStyle.getPropertyValue('display');

        if (navStyleDisplay == 'none') {

            navElem[i].style.display = 'grid';

        } else {

            navElem[i].style.display = 'none';
        }
    }
}

/******************************************************************************
*
* Toggle animation for hamburger icon in menu
* 
*****************************************************************************/
function toggleHamIcon() {
    // toggle hamburger icon bars given current state
    let barElems = document.getElementsByClassName('ham-container');
    for (var i = 0; i < barElems.length; i++) {
        barElems[i].classList.toggle('change');
    }
}

/******************************************************************************
*
* reset menu to default state
* 
*****************************************************************************/
function resetMenu() {
    // hide menu
    let navElem = document.getElementsByClassName('nav-links');
    for (var i = 0; i < navElem.length; i++) {
        let navStyle = window.getComputedStyle(navElem[i], null);
        let navStyleDisplay = navStyle.getPropertyValue('display');
        navElem[i].style.display = 'none';
    }
    // reset menu icon
    let barElems = document.getElementsByClassName('ham-container');
    for (var i = 0; i < barElems.length; i++) {
        barElems[i].classList.remove('change');
    }
}

/******************************************************************************
*
* move to top of page from footer
* 
*****************************************************************************/
topButton.addEventListener('click', function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
})

/******************************************************************************
 * p5.js sketch
 * 
 * Project:  My version of a Minesweeper clone. Converted from 
 * a java version developed for Processing
 * 
 * Author:   Yahir
 * 
 * Date:     October 2021
 * 
 * Notes:
 * - LEFT CLICK on cell to reveal
 * - SHIFT + LEFT CLICK to place a flag
 * - PRESS reset button to reset grid
 ******************************************************************************/
var fontMontserrat;
var parentWidth;

var dots = [];              // store history of guesses as dots
// [0] = easy | [1] = hard
var numDots = [];           // number of dot guess history to show
var target = [];            // target position [0] = x | [1] = y
var targetSize = [];        // size of the target position
var playAreaX = [];         // clickable area dimensions x
var playAreaY = [];         // clickable aray dimensions y
var playerClicksMax = [];   // number of max click per round
var difficulty;             // difficulty level
var averageDistance;        // track average click distance
var playerScore;            // track player score
var playerClicks;           // track number of clicks
var playerLevel;            // current player level    
var gameState;              // playing, level complete, game over... 
var playAreaAlpha;          // contro alpha value for play area
var playAreaAlphaSpd;       // fade in speed for play area

/******************************************************************************
 * 
 * Preload assessts prior to running setup function
 * 
 *****************************************************************************/
function preload() {
    fontMontserrat = loadFont('../assets/Montserrat-Light.ttf');
}

/******************************************************************************
 * 
 * set up canvas
 * 
 *****************************************************************************/
function setup() {
    // set up canvas
    parentWidth = document.getElementById('p5-canvas').offsetWidth;
    let canvas = createCanvas(parentWidth, parentWidth);
    canvas.parent('p5-canvas');

    // set up font
    textAlign(CENTER, CENTER);
    textFont(fontMontserrat);

    // global stuff
    difficulty = 0;
    playAreaAlpha = 0;
    playAreaAlphaSpd = 1.5;  
    gameState = 0;

    playAreaX = [30, width - 30];
    playAreaY = [50, height - 30];
    numDots = [4, 8];

    playerLevel = 1; 
    playerClicksMax = [10, 20];
    playerScore = 0;
    playerClicks = 0;
    averageDistance = 0;

    targetSize = [40, 60];
    target = [int(random(playAreaX[0], playAreaX[1])), int(random(playAreaY[0], playAreaY[1]))];
    dots = [];
}

/******************************************************************************
 * 
 * draw canvas
 * 
 *****************************************************************************/
function draw() {
    background(242, 232, 220);

    /* quick check for device screen size. 
    * kills sketch. could look into a more responsive approach.
    */ 
    if (parentWidth < 800) {
        console.log("too small")
        textAlign(CENTER, CENTER);
        text("device screen too small for sketch", width / 2, height / 2);
        noLoop();
        return;
    }

    // top bar
    fill(181, 204, 169);
    noStroke();
    rect(0, 0, width, playAreaY[0]);

    // state transition
    fill(0, playAreaAlpha);
    rect(0, 0, width, height);
    
    // based on game state
    switch(gameState) {
        // playing
    case 1:
        playAreaAlpha -= playAreaAlphaSpd;
        if (playAreaAlpha < 0) playAreaAlpha = 0;

        showDots();

        break;
        // level complete
    case 2:
        playAreaAlpha += playAreaAlphaSpd;
        if (playAreaAlpha > 70) playAreaAlpha = 70;
        fill(255, 255, 255);
        text("level " + playerLevel + " complete\nclick to advance", width/2, height/2);
        
        // show elements
        showTarget();
        showDots();
        break;

        // game over
    case 3:
        // fade in
        playAreaAlpha += playAreaAlphaSpd;
        if (playAreaAlpha > 80) playAreaAlpha = 80;

        fill(255, 255, 255);
        text("game over", width/2, height/2);
        text("final score: " + playerScore, width/2, height/2 + 40);
        text("completed levels: " + (playerLevel - 1), width/2, height/2 + 60);

        // show elements
        showTarget();
        showDots();
        break;

        // landing page
    case 0:
    default:
        // fade in
        playAreaAlpha += playAreaAlphaSpd;
        if (playAreaAlpha > 80) playAreaAlpha = 80;
        fill(255, 255, 255);
        text("welcome\nclick to begin", width/2, height/2);
        break;
    }
    
   // user ui text
  fill(255, 255, 255);
  
  textAlign(CENTER, CENTER);
  textSize(24);
  text("find me", width/2, 20);
  textSize(16); 
  text("Level", 50, 15);
  text(playerLevel, 50, 35);
  text("avg. distance", 200, 15);
  text(averageDistance, 200, 35);
  text("remaining", width - 50, 15);
  text((playerClicksMax[difficulty] - playerClicks), width - 50, 35);
  text("score", width - 200, 15);
  text(playerScore, width - 200, 35);

}

/******************************************************************************
 * 
 * track mouse released
 *
 *****************************************************************************/
function mouseReleased() {
    // take action based on game state
  if (mouseButton == LEFT && mouseX > 0 && mouseX < width
    && mouseY > 0 && mouseY < height) {
    switch(gameState) {
      // playing
    case 1:
      if(mouseY > playAreaY[0]) {
        newGuess();
        checkGameEnd();
        updateAverage();
        playerClicks++;
      }
      break;

      // level complete
    case 2:
      resetLevel();
      gameState = 1;
      break;

      // game over
    case 3:
      resetGame();
      gameState = 1;
      break;

      // landing page
    case 0:
    default:
      gameState = 1;
      break;
    }
  }
}

/******************************************************************************
 * 
 * class for creating a guess dot
 * 
 *****************************************************************************/
class Dot {
    /**
     * Constructor method for Cell class
     *
     * @param {int} _x    the x position of the Cell (index)
     * @param {int} _y    the y position of the Cell (index)
     */
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
        this.dotSize = 50;
        this.distance = int(dist(_x, _y, target[0], target[1]));
        this.alpha = 70;
        this.alphaSpeed = map(this.distance, 0, 900, 2, 0.5);
    }

    display() {
        // alpha speed user feedback
        this.alpha += this.alphaSpeed;
        if (this.alpha < 20 || this.alpha > 100) this.alphaSpeed *= -1;
        stroke(181, 204, 169, this.alpha); 
        strokeWeight(4);
        fill(242, 232, 220, 50);
        ellipse(this.x, this.y, this.dotSize, this.dotSize);
        strokeWeight(1);
        
        // text feedback
        if (difficulty == 0) {
        fill(0);
        textSize(12);
        textAlign(CENTER, CENTER);
        text(this.distance, this.x, this.y);
        }
    }
}

/******************************************************************************
 * 
 * reset game elements after game over
 * 
 *****************************************************************************/
function resetGame() {
    playerClicks = 0;
    playerClicksMax[0] = 10;
    playerClicksMax[1] = 5;
    playerScore = 0;
    playerLevel = 1;
    averageDistance = 0;
    resetTarget();
  
    dots = [];
  }
  
  /******************************************************************************
   * 
   * reset level after level completion
   * 
   *****************************************************************************/
  function resetLevel() {
  
    if (playerLevel % 3 == 0) {
      playerClicksMax[difficulty]--;
      if (playerClicksMax[difficulty] < 2) playerClicksMax[difficulty] = 2;
    }
    playerLevel++;
    playerClicks = 0;
    dots = [];
    resetTarget();
  }
  
  /******************************************************************************
   * 
   * reset target positions
   * 
   *****************************************************************************/
  function resetTarget() {
    target[0] = int(random(playAreaX[0], playAreaX[1]));
    target[1] = int(random(playAreaY[0], playAreaY[1]));
  }
  
  /******************************************************************************
   * 
   * on new guess
   * 
   *****************************************************************************/
  function newGuess() {
    dots.push(new Dot(mouseX, mouseY));
    if (dots.length > numDots[difficulty]) dots.shift();
  }
  
  /******************************************************************************
   * 
   * show the guess dots
   * 
   *****************************************************************************/
  function showDots() {
    for(var i = 0; i < dots.length; i++) {
      dots[i].display();
    }
  }
  
  /******************************************************************************
   * 
   * show the target element
   * 
   *****************************************************************************/
  function showTarget() {
    fill(190, 154, 130);
    let rad = targetSize[difficulty];
    ellipse(target[0], target[1], rad, rad);
  }
  
  /******************************************************************************
   * 
   * update average distance to target value
   * 
   *****************************************************************************/
  function updateAverage() {
    if (dots.length == 1) {
      averageDistance = int(averageDistance +  dots[dots.length - 1].distance);
    } else if (dots.length > 0) {
      averageDistance = int((averageDistance +  dots[dots.length - 1].distance) / 2);
    }
  }
  
  /******************************************************************************
   * 
   * update the player score
   * 
   *****************************************************************************/
  function updateScore() { 
    let distAllowed = (dots[dots.length - 1].dotSize / 2) + (targetSize[0] / 2);
    playerScore += int((playerClicksMax[difficulty] - playerClicks) * (distAllowed - dots[dots.length - 1].distance));
  }
  
  /******************************************************************************
   * 
   * update the player final score on game end
   * 
   *****************************************************************************/
  function updateFinalScore() {
    playerScore -= int(averageDistance);
    if (playerScore < 0) playerScore = 0;
  }
  
  /******************************************************************************
   * 
   * check if game has ended or level has been cleared
   * 
   *****************************************************************************/
  function checkGameEnd() {
    if (dots.length > 0) {
        console.log(dots[dots.length - 1].x, dots[dots.length - 1].y);
      let distToTarget = int(dist(dots[dots.length - 1].x, dots[dots.length - 1].y, target[0], target[1]));
      let distAllowed = (dots[dots.length - 1].dotSize / 2) + (targetSize[difficulty] / 2);
  
      if (distToTarget < distAllowed) {
        updateScore();
        gameState = 2;
      }
      if (playerClicks >= playerClicksMax[difficulty] - 1) {
        updateFinalScore();
        gameState = 3;
      }
    }
  }
  
//=============================================================================
// p5 button events
//=============================================================================

/******************************************************************************
*
* toggle select and deselcting cells on button
* 
*****************************************************************************/
difficultyButton.addEventListener('click', function() {
    difficulty ++;
    if(difficulty > 1) difficulty = 0;
    // update image for user feedback
    let symbolElement = document.getElementById('p5-button-1-symbol');
    if(difficulty == 0) {
      symbolElement.innerHTML = "&#11096"
    } else {
      symbolElement.innerHTML = "&#8416"
    }
    resetGame();
      gameState = 1;
  });

/******************************************************************************
*
* reset game when button clicked
* 
*****************************************************************************/
resetGameButton.addEventListener('click', function() {
    resetGame();
    gameState = 1;
});
