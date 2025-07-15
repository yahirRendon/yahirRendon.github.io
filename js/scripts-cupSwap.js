
/******************************************************************************
*
* javascript for cup swap game
* 
*****************************************************************************/
const difficultyButton = document.getElementById('button-p5-1');
const submitGuessButton = document.getElementById('button-p5-2');
const resetGameButton = document.getElementById('button-p5-3');
// const button1Symbol = document.getElementById('p5-button-1-symbol');
// const button2Symbol = document.getElementById('p5-button-2-symbol');
// const button3Symbol = document.getElementById('p5-button-3-symbol');

/******************************************************************************
*
* run when everything has loaded
* 
*****************************************************************************/
// window.onload = function () {}

// window.addEventListener("load", function() {});

/******************************************************************************
*
* run when scrolling is occuring
* 
*****************************************************************************/
// window.onscroll = function () {}

/******************************************************************************
*
* trigger when scrolling has ended
* 
*****************************************************************************/
// window.onscrollend = function () {}

/******************************************************************************
*
* run when mouse is moving
* 
*****************************************************************************/
// onmousemove = function (event) {}

/******************************************************************************
* Turn off default functionaliity of space key
* 
*****************************************************************************/
window.addEventListener("keydown", function (e) {
    if (["Space"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

/******************************************************************************
 * p5.js sketch
 * 
 * Project:  My version of a Minesweeper clone. Converted from a java version 
 * developed for Processing
 * 
 * Author:   Yahir
 * 
 * Notes:
 * - LEFT CLICK on cell to reveal
 * - SHIFT + LEFT CLICK to place a flag
 * - PRESS reset button to reset grid
 * 
 ******************************************************************************/
var myFont;
var parentWidth;

var cupImagesOriginal = [];    // hold original loaded images
var cupImages = [];            // array of cup images shuffled   
var cups = [];           // array of cup objects
let targetOrder = [];             // array containing targer order for cups

var cupImgWidth;               // witdth of cup image
var cupImgHeight;              // height of cup image
var numCups;                   // number of cups in play (3-5)
var numCupsCorrect;            // number of cups matching target order
var numGuessesRound;           // number of guesses per round
var numGuessesTotal;           // number of total guess in game
var roundCounter;                     // the game round

var waitingToSwap;         // track when to swap cups after moving
var firstSelected;             // track when cup is first clicked
var swapCupA, swapCupB;        // track two cups to be swapped a and b

var gameDelay;                 // delay amount between rounds
var gameTimer;                 // set time for game delay
var roundOver;             // trigger game delay when round is over

var winTimer;                  // timer when round over/won
var winCupDelay;               // time delay between win animation
var winCupCounter;             // count cup animation progression
var winIncAmt;                 // cup increment value on win animation


/******************************************************************************
 * 
 * Preload assessts prior to running setup function
 * 
 *****************************************************************************/
function preload() {
  myFont = loadFont('../assets/Poppins-Light.ttf');


  cupImagesOriginal[0] = loadImage("../assets/cupSwap/coffee_cup.png");
  cupImagesOriginal[1] = loadImage("../assets/cupSwap/paper_cup.png");
  cupImagesOriginal[2] = loadImage("../assets/cupSwap/plain_cup.png");
  cupImagesOriginal[3] = loadImage("../assets/cupSwap/plastic_cup.png");
  cupImagesOriginal[4] = loadImage("../assets/cupSwap/tea_cup.png");
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
  textFont(myFont);

  // game elements
  cupImgWidth = 120;
  cupImgHeight = 120;

  numCups = 5;
  // cupImages = [];
  // cupImagesOriginal = [];


  waitingToSwap = false;
  firstSelected = null;
  swapCupA = null;
  swapCupB = null;

  generateCups();

  roundOver = false;
  roundCounter = 1;
  numGuessesRound = 0;
  numGuessesTotal = 0;
  numCupsCorrect = 0;
  gameDelay = 4000;
  gameTimer = millis();

  winCupCounter = 0;
  winIncAmt = 1;
  winCupDelay = 150;
  winTimer = millis();
}

/******************************************************************************
 * 
 * draw canvas
 * 
 *****************************************************************************/
function draw() {
  background(255, 253, 242);

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

  // game elements
  textSize(12);

  // update and display cups
  for (let i = 0; i < cups.length; i++) {
    cups[i].update();
    cups[i].display();
  }

  // swap cup in cups index after arc moving animation
  if (waitingToSwap) {
    if (!swapCupA.isMoving && !swapCupB.isMoving) {
      let indexA = cups.indexOf(swapCupA);
      let indexB = cups.indexOf(swapCupB);

      // swap cup positions in the array
      let temp = cups[indexA];
      cups[indexA] = cups[indexB];
      cups[indexB] = temp;
      waitingToSwap = false;
    }
  }

  // display game text and trigger round delays
  fill(80);
  if (roundOver) {

    textSize(32);
    text("winner!", width / 2, 635);

    // up/down cup animation on win
    if (millis() > winTimer + winCupDelay) {
      winTimer = millis();
      let curCup = cups[winCupCounter];
      if (curCup.y != curCup.yHome) {
        curCup.setupMovement(curCup.x, curCup.yHome, 250, "VERTICAL");

      } else {
        curCup.setupMovement(curCup.x, curCup.yHome - 40, 250, "VERTICAL");
      }
      winCupCounter = winCupCounter + winIncAmt;
      if (winCupCounter > numCups - 1 || winCupCounter < 0) winIncAmt *= -1;
      if (winCupCounter < 0) winCupCounter = 0;
      if (winCupCounter > numCups - 1) winCupCounter = numCups - 1;
    }

    if (millis() > gameTimer + gameDelay) {
      generateCups();
      roundCounter++;
      numGuessesRound = 0;
      roundOver = false;
      numCupsCorrect = 0;
      winCupCounter = 0;
      winIncAmt = 1;
    }
  }

  textSize(16);
  text("round guesses", 100, 30);
  text(numGuessesRound, 100, 60);
  text("round", width / 2, 30);
  text(roundCounter, width / 2, 60);
  text("total guesses", width - 100, 30);
  text(numGuessesTotal, width - 100, 60);

  if (numGuessesRound != 0 && !roundOver) {
    textSize(16);
    text("cups correct", width / 2, 620);
    textSize(28);
    text(numCupsCorrect, width / 2, 650);
  }

}

/******************************************************************************
 * MOUSEPRESSED PRESSED
 * 
 * LEFT CLICK             | select cups
 *****************************************************************************/
function mouseClicked() {
  if (mouseButton == LEFT) {
    for (var i = 0; i < cups.length; i++) {
      if (cups[i].hover()) {
        // no cup selected
        if (firstSelected == null) {
          firstSelected = cups[i];
          cups[i].setupMovement(cups[i].x, cups[i].yHome - 40, 250, "VERTICAL");
          // if cup already selected
        } else if (cups[i] == firstSelected) {
          c.setupMovement(cups[i].x, cups[i].yHome, 250, "VERTICAL");
          firstSelected = null;
          // two different cups selected
        } else if (cups[i] != firstSelected) {
          cups[i].setupMovement(firstSelected.x, firstSelected.yHome, 700, "ARC");
          firstSelected.setupMovement(cups[i].x, cups[i].yHome, 700, "ARC");
          // set up swap
          swapCupA = cups[i];
          swapCupB = firstSelected;
          waitingToSwap = true;
          firstSelected = null;
        }
      }
    }
  }
}

/******************************************************************************
 * KEY PRESSED
 *
 * - SPACE KEY : submit guess
******************************************************************************/
function keyPressed() {
    if (key == ' ') {
      checkCupOrder();
    }
  }

/******************************************************************************
 * create a shuffled array of indices using Fisher–Yates algorithm
 *
 * returns a newly shuffled array of length n
 *****************************************************************************/
function shuffledIndices(n) {
  let idx = [n];
  for (var i = 0; i < n; i++) {
    idx[i] = i;
  }
  for (var i = n - 1; i > 0; i--) {
    let j = parseInt(random(i + 1));
    let tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }
  return idx;
}

/******************************************************************************
 * 
 * generate a new arrangement of cups, target order, and spawn animations
 *****************************************************************************/
function generateCups() {

  // shuffle the array of cupImages to get unique image order
  var shuffled = shuffledIndices(5);
  for (var i = 0; i < 5; i++) {
    cupImages[i] = cupImagesOriginal[shuffled[i]];
  }

  // add unique order cups and ids to cups array
  cups = [];
  var mixedOrder = shuffledIndices(numCups);
  for (var i = 0; i < numCups; i++) {
    let dex = mixedOrder[i];
    let xOffset = width / 2 - ((numCups * cupImgWidth) / 2);
    let yOffset = height / 2 - cupImgHeight / 2;
    let xCur = xOffset + i * cupImgWidth;
    let yCur = yOffset;
    cups.push(new Cup(dex, xCur, yCur, cupImages[dex]));
  }

  // move cups to center and animate
  for (var i = 0; i < numCups; i++) {
    cups[i].setToCenter();
    cups[i].arcToHome();
  }

  // set target order with none matching to start
  var numCorrect = numCups;
  while (numCorrect >= 1) {
    targetOrder = shuffledIndices(numCups);
    numCorrect = 0;
    for (var i = 0; i < cups.length; i++) {
      if (cups[i].id == targetOrder[i]) numCorrect++;
    }
  }

  // for testing
  // for (var i = 0; i < targetOrder.length; i++) {
  //   print(targetOrder[i] + " ");
  // }
  // println();
}


// /******************************************************************************
//  * Check cups arrangement to target order and update game statistics
//  *
//  *
//  *****************************************************************************/
function checkCupOrder() {
  numGuessesRound++;
  numGuessesTotal++;
  let numCorrect = 0;
  for (var i = 0; i < cups.length; i++) {
    if (cups[i].id == targetOrder[i]) numCorrect++;
  }
  numCupsCorrect = numCorrect;
  if (numCorrect == numCups) {
    roundOver = true;
    gameTimer = millis();
    winTimer = millis();
  }
}

/******************************************************************************
 * reset the game numbers/statestics
 *
 *
 *****************************************************************************/
function resetGameStats() {
  roundOver = false;
  roundCounter = 1;
  numGuessesRound = 0;
  numGuessesTotal = 0;
  numCupsCorrect = 0;
  winCupCounter = 0;
  winIncAmt = 1;
}

/******************************************************************************
 * class for creating a cup object with animations
 *
 * 
 *****************************************************************************/
class Cup {

  /******************************************************************************
   * constructor
   * 
   * @param  id         the unique cup id
   * @param  x          the x position of the cup
   * @param  y          the y position of the cup
   * @param  img        the image of the 
   *****************************************************************************/
  constructor(id, x, y, img) {
    this.id = id;                        // the cup id
    this.x = x;                          // the x and y values (pixels)
    this.y = y;
    this.yHome = y;                      // the home/start x and y values (pixels)
    this.xHome = x;
    this.img = img;                      // the cup image
    this.selected = false;               // track if the cup has been selected

    // for animations
    this.startX = -100.0;
    this.startY = -100.0;
    this.targetX = -100.0;
    this.targetY = -100.0;
    this.startTime = millis();
    this.duration = -100.0;
    this.isMoving = false;
    this.moveType = null;
    this.arcHeight = random(100, 160);
  }

  /******************************************************************************
   * determine if mouse is over cup
   *
   * return true if hover else return false
   *****************************************************************************/
  hover() {
    var xmid = this.x + cupImgWidth / 2;
    var ymid = this.y + cupImgHeight / 2;
    //ellipse(xmid, ymid, 100, 100);
    if (dist(mouseX, mouseY, xmid, ymid) < 50) {
      return true;
    } else {
      return false;
    }
  }

  /******************************************************************************
   * method to set x value to center of sketch
   *****************************************************************************/
  setToCenter() {
    this.x = width / 2;
    this.x = this.yHome;
  }

  /******************************************************************************
   * helper method to move to home x and y position in arc motion
   *****************************************************************************/
  arcToHome() {
    this.setupMovement(this.xHome, this.yHome, int(random(600, 750)), "ARC");
  }

  /******************************************************************************
   * helper method to move cup vertically
   *****************************************************************************/
  moveVertical(targetX, targetY, duration) {
    this.setupMovement(targetX, targetY, duration, "VERTICAL");
  }

  /******************************************************************************
   * helper method to move cup horizontally
   *****************************************************************************/
  moveHorizontal(targetX, targetY, duration) {
    this.setupMovement(targetX, targetY, duration, "HORIZONTAL");
  }

  /******************************************************************************
   * helper method method to move cup in arc 
   *****************************************************************************/
  moveArc(targetX, targetY, duration) {
    this.setupMovement(targetX, targetY, duration, "ARC");
  }

  /******************************************************************************
   * method to set up values for moving cup
   *****************************************************************************/
  setupMovement(tx, ty, dur, type) {
    this.startX = this.x;
    this.startY = this.y;
    this.targetX = tx;
    this.targetY = ty;
    this.duration = dur;
    this.startTime = millis();
    this.moveType = type;
    this.isMoving = true;
    this.arcHeight = random(180, 260);
  }

  /******************************************************************************
   * update animations
   *****************************************************************************/
  update() {
    if (!this.isMoving) return;

    var t = (millis() - this.startTime) / this.duration;
    t = constrain(t, 0, 1);

    if (this.moveType === "VERTICAL") {
      this.x = this.startX;
      this.y = lerp(this.startY, this.targetY, t);

    } else if (this.moveType === "HORIZONTAL") {
      this.x = lerp(this.startX, this.targetX, t);
      this.y = this.startY;

    } else if (this.moveType === "ARC") {
      // Linear x and y interpolation
      var lx = lerp(this.startX, this.targetX, t);
      var ly = lerp(this.startY, this.targetY, t);

      // Parabolic arc using sine for smooth up-down
      var arcY = -sin(PI * t) * this.arcHeight;
      this.x = lx;
      this.y = ly + arcY;
    }

    if (t >= 1) {
      this.isMoving = false;
      this.x = parseInt(this.x);
      this.y = parseInt(this.y);

    }
  }

  /******************************************************************************
   * display the cup
   *****************************************************************************/
  display() {
    image(this.img, this.x, this.y);
  }
}

/******************************************************************************
*
* p5 button events
* 
*****************************************************************************/
/******************************************************************************
*
* set game difficulty when button clicked (3 - 5 cups)
* 
*****************************************************************************/
difficultyButton.addEventListener('click', function () {
  numCups++;
  if (numCups > 5) numCups = 3;
  generateCups();
  resetGameStats();
});
/******************************************************************************
*
* submit a guess when button clicked
* 
*****************************************************************************/
submitGuessButton.addEventListener('click', function () {
  checkCupOrder();
});
/******************************************************************************
*
* reset game when button clicked
* 
*****************************************************************************/
resetGameButton.addEventListener('click', function () {
  generateCups();
  resetGameStats();
});

