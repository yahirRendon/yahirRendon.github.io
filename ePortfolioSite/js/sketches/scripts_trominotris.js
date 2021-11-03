/**************************************************************
 Project:  scripts page for portfolio implementation of the
           basics of a Minesweeper clone
 Author:   Yahir
 Date:     October 2021
 
 **************************************************************/

/**
 * On windowload check navigaton display and
 * set onClick listeners
 */
window.onload = function () {
  navigationBarToggle();
  
  $('#resetButton').click(function () {
		resetGame();
	})
}

window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
  }
}, false);

/**
 * Toggle the navigation bar between show/hide
 */
function navigationBarToggle() {
	// on menuButton click toggle show/hide menu
	$("#menuButton").click(function () {
		if ($('.e_nav').css('display') == 'none') {
			$(".e_nav").css({ display: "flex" }).show();
		} else {
			$(".e_nav").css({ display: "none" }).hide();
		}
	})
}

/**************************************************************
 Project:  A minimal version of Tetris using trominos
 Author:   Yahir
 Date:     November 2021
 
 Notes:
 1. SPACE KEY to start and pause game
 2. Use arrow keys to move and rotate tromino
 
Credits
Music theme: Benjamin Tissot of Bensound
  https://www.bensound.com/royalty-free-music/track/slow-motion
Clear Row Sound: LittleRobotSoundFactory
  https://freesound.org/people/LittleRobotSoundFactory/sounds/270524/
Trominotris Sound: Leszek_Szary
  https://freesound.org/people/Leszek_Szary/sounds/171671/
Reset Sound: colorsCrimsonTears
  https://freesound.org/people/colorsCrimsonTears/sounds/562292/
Block Land Sound: Yahir mixed in Ableton Live

Processing 3.5.4
 **************************************************************/

var myfont;
var cells = []; 
var blocks = [];
var gridHeight;
var gridWidth;

var timeMarker;
var dropSpeed;
var dropDecrement;           // amount deducted from dropSpeed at each level
var nextPiece;

var score;                   // track user score
var level;                   // track user level (increments every 5 lines)
var totalLinesCleared;       // track total lines cleared by user
var linesCleared;            // track lines cleared per level
var priorLinesCleared;       // track lines for level advance
var gameOver;                // toggle game over

var clearAnimationActive;    // track if row clearing animation is active
var clearAnimationDone;      // trigger when row clearing animation is done
var gameScreen;

var t; // current tromino

var leftDAS;
var rightDAS;
var upDAS;
var downDAS;

var soundTheme;

function preload() {
    soundTheme = loadSound('../../assets/bensound-slowmotion_loop-modified.mp3')
//     myfont = loadFont('assets/MontserratAlternates-Light.otf');

}


function setup() {
  var parentWidth = document.getElementById('p5Canvas').offsetWidth;
  var parentHeight = document.getElementById('p5Canvas').offsetHeight;
  var canvas = createCanvas(800, 800);
 
  // Move the canvas so it’s inside div with id="p5Canvas">.
  canvas.parent('p5Canvas');

//   textFont(myFont);
  // textSize(36);
  // text('p5*js', 10, 50);
  
  gridHeight = 16;
  gridWidth = 7;
  dropSpeed = 700;
  dropDecrement = 50;
  
  score = 0;
  level = 0;
  totalLinesCleared = 0;
  linesCleared = 0;
  priorLinesCleared = 0;
  gameOver = false;
  nextPiece = parseInt(random(0, 2));
  clearAnimationActive = false;
  clearAnimationDone = false;
  gameScreen = 0;
  
  // create play area grid
  cells = [];
  for(var y = 0; y < gridHeight; y++) {
    for(var x = 0; x < gridWidth; x++) {
      append(cells, new Cell(x, y, 0));
    }
  }
  
  t = new Tromino();
  leftDAS = new DAS();
  rightDAS = new DAS();
  downDAS = new DAS();
  upDAS = new DAS();
  timeMarker = millis();

}


function draw() {
  background(245, 244, 240);
  textFont('Arial');
  switch(gameScreen) {
    case 0: // intro
      displayGameCore();
      textSize(24);
      fill(115, 138, 152);
      text("SPACE to start", 400, 400);
    break;
    case 1: // play
      // update user keyboard inputs
      updateInputs();
      displayGameCore();
      displayScoreElements();
      gameMechanics();
    break;
    case 2: // pause
      displayGameCore();
      displayGameTrominoes();
      textSize(24);
      fill(115, 138, 152);
      text("Game Paused", 400, 400);
    break;
  }  
    
}

/**
* rest the game grid, pieces, and score elements
*/
function resetGame() {
  score = 0;
  level = 0;
  totalLinesCleared = 0;
  linesCleared = 0;
  priorLinesCleared = 0;
  dropSpeed = 700;
  dropDecrement = 50;
  gameOver = false;
  nextPiece = parseInt(random(0, 2));
  clearAnimationActive = false;
  clearAnimationDone = false;
  gameScreen = 1;
  
  // create play area grid
  cells = [];
  for(var y = 0; y < gridHeight; y++) {
    for(var x = 0; x < gridWidth; x++) {
      append(cells, new Cell(x, y, 0));
    }
  }
  blocks = [];
  t = new Tromino();
  timeMarker = millis();
}

function displayNextPiece() {
  
  stroke(169, 176, 182);
  stroke(115, 138, 152);
  switch(nextPiece) {
  case 1:
    fill(157, 193, 209);
    rect(62, 350, 50, 50, 10);
    rect(62, 400, 50, 50, 10);
    rect(112, 400, 50, 50, 10);
    break;
  case 2:
    fill(61, 98, 124);
    rect(112, 350, 50, 50, 10);
    rect(62, 400, 50, 50, 10);
    rect(62, 450, 50, 50, 10);
  break;
  case 3:
    fill(232, 139, 106);
    rect(37, 400, 50, 50, 10);
    rect(87, 450, 50, 50, 10);
    rect(137, 400, 50, 50, 10);
  break;
  default:
    fill(246, 210, 174);
    rect(87, 350, 50, 50, 10);
    rect(87, 400, 50, 50, 10);
    rect(87, 450, 50, 50, 10);
    break;
  }
}



/**************************************************************
KEY PRESSED
 
 - LEFT  : engage left DAS
 - RIGHT : engage right DAS
 - UP    : engage up DAS
 - DOWN  : engage down DAS
 **************************************************************/
function keyPressed() {
  if(keyCode === LEFT_ARROW) {
    leftDAS.engaged = true;
  }  
  if(keyCode === RIGHT_ARROW) {
    rightDAS.engaged = true;
  }
  if(keyCode === UP_ARROW) {
    upDAS.engaged = true;
  }
  if(keyCode === DOWN_ARROW) {
    downDAS.engaged = true;
  }
  if(key == ' ') {
   if(gameScreen == 0) {
    soundTheme.loop();
   }
    gameScreen ++;
   
    if(gameScreen > 2) {
      gameScreen = 1;
    }
  }
}

/**************************************************************
KEY RELEASED 
 
 - LEFT  : desengage left DAS
 - RIGHT : desengage right DAS
 - UP    : desengage up DAS
 - DOWN  : desengage down DAS
 **************************************************************/
function keyReleased() {
  if(keyCode === LEFT_ARROW) {
    leftDAS.engaged = false;
  } 
  if(keyCode === RIGHT_ARROW) {
    rightDAS.engaged = false;
  }
  if(keyCode === UP_ARROW) {
    upDAS.engaged = false;
  }
  if(keyCode === DOWN_ARROW) {
    downDAS.engaged = false;
  }   
}

/**************************************************************
Function for controlling user input
 
 - LEFT  : Move current tromino left
 - RIGHT : Move current tromino right
 - DOWN  : Move current tromino down
 - UP    : Rotate current tromino clockwise
 **************************************************************/
function updateInputs() {
  leftDAS.update();
  rightDAS.update();
  upDAS.update();
  downDAS.update();
  if(leftDAS.active) {
    t.moveLeft();
  }
  if(rightDAS.active) {
    t.moveRight();
  }
  if(upDAS.active) {
    t.rotateShape();
  }  
  if(downDAS.active) {
    t.moveDown();
  }   
}

function gameMechanics() {
  // drop current tromino at desired speed
  // while game is not over
  if(!gameOver && !clearAnimationActive) {
    if(level > 7) {
      dropDecrement = 25;
    }
    if(millis() > timeMarker + dropSpeed) {
      // continue moving block down if possible
      if(t.canMoveDown()) {
        t.moveDown();
      } else {
        // block cannot move down 
        // push tromino to block list and create new
        t.startLandAnimation();
        t.pushBlocks(blocks);

        // check if rows can be cleared
        checkRows();
        t.createNewTromino(nextPiece);
        if(level > 0 && level % 1 == 0) {
          var rand = parseInt(random(0, 3));
          if(rand == 2) {
            nextPiece = parseInt(random(0, 4));
          } else {
            nextPiece = parseInt(random(0, 2));
          }
        
        } else {
          nextPiece = parseInt(random(0, 2));
        }
      }
      timeMarker = millis();
    }
  }
  
  if(clearAnimationActive) {
    for(var b = 0; b < blocks.length; b++) {
      if(blocks[b].doneClear) {
        clearAnimationDone = true;
      }
    }
  }
  
  if(clearAnimationDone) {
    clearFullRows();
    clearAnimationActive = false;
    clearAnimationDone = false;
  }
  
  displayNextPiece();
  displayGameTrominoes();
}

function displayGameTrominoes() {
  for(i = 0; i < blocks.length; i++) {
    blocks[i].display();
  }
  
  t.display();
}

/**
* Display game information such as title, score, lines, levels
*/
function displayGameCore() {
  
  // game are rectangle
  fill(208, 210, 205, 100);
  stroke(115, 138, 152);
  rect(225, 75, 350, 650, 10);
  
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(115, 138, 152);
  // text("trominotris", width/2, 50);

  textSize(14);
  // text("by yahir", width/2, height - 25);
}

function displayScoreElements() {
  textSize(26);
  fill(115, 138, 152);
  text(score, 688, 400);

  textSize(18);
  fill(169, 176, 182);
  text(level, 688, 350);
  text(totalLinesCleared, 688, 450);
}

/**
* method for clearing rows when torminos settle
*/
function checkRows() {  
  var tempLinesCleared = 0;
  // loop through each row in the play area
  for(var y = 3; y < gridHeight; y++) {
    
    // sum the states of each cell in the row
    let rowSum = 0;
    for(var x = 0; x < gridWidth; x++) {
      rowSum += cells[x + y * gridWidth].state;
    }
    
    // if row summ is equal to grid width the 
    // row is full and can be cleared
    if(rowSum == gridWidth) {  
      tempLinesCleared++;
      totalLinesCleared++;
      linesCleared++;
      for(var x = 0; x < gridWidth; x++) {
        for(var b = 0; b < blocks.length; b++) {
          if(blocks[b].y == y) {
            blocks[b].startClear = true;
            clearAnimationActive = true;
          }
        }
      }  
    }
  }
  
  for(var x = 0; x < gridWidth; x++) {
    if(cells[x + 2 * gridWidth].state == 1) {
      gameOver = true;
    }
  }
  
  // increment level per desired lines cleared
  if (linesCleared >= priorLinesCleared + 5) {
    level++;    
    linesCleared = priorLinesCleared;
    dropSpeed -= dropDecrement;
    if(dropSpeed < 150) {
      dropSpeed = 150;
    }
  }
  
  var levelBonus = map(level, 0, 10, 1, 5.0);
  if (tempLinesCleared == 3) {
    score += parseInt(100 * levelBonus);
  } else if (tempLinesCleared == 2) {
    score += parseInt(50 * levelBonus);
  } else if (tempLinesCleared == 1) {
    score += parseInt(25 * levelBonus);
  } 
}

/**
* method for clearing rows when torminos settle
*/
function clearFullRows() {  
  // loop through each row in the play area
  for(var y = 3; y < gridHeight; y++) {
    
    // sum the states of each cell in the row
    let rowSum = 0;
    for(var x = 0; x < gridWidth; x++) {
      rowSum += cells[x + y * gridWidth].state;
    }
    
    // if row summ is equal to grid width the 
    // row is full and can be cleared
    if(rowSum == gridWidth) {  
      for(var x = 0; x < gridWidth; x++) {
        // change state of gride cells and remove blocks in row
        cells[x + y * gridWidth].state = 0; 
        for(var b = 0; b < blocks.length; b++) {
          if(blocks[b].y == y) {
            blocks.splice(b, 1);
          }
        }
      }  
      
      // loop through blocks to shift blocks down if above cleared row
      for(var b = 0; b < blocks.length; b++) {
        if(blocks[b].y < y) {
         cells[blocks[b].x + blocks[b].y * gridWidth].state = 0; 
         blocks[b].y ++;
         blocks[b].updatePosition();
         cells[blocks[b].x + blocks[b].y * gridWidth].state = 1;
        }
      }
      
      // loop through all blocks and set state of corresponding grid cell
      for(var b = 0; b < blocks.length; b++) {
         cells[blocks[b].x + blocks[b].y * gridWidth].state = 1;   
      }
    }
  }
}

/**************************************************************
 Class for trominoes and methods for moving within game grid
 - I or Long piece
 - L piece

 **************************************************************/
class Tromino {
  // int orientation;             // track orientation of the tromino for rotations       
  // ArrayList<Block> tromino;    // list of three blocks that make up tromino
  // int type;                    // the type of tromino created (0 = I and 1 = L)
  
  /**
  * Constructor method for Tromino class
  *
  */
  constructor() {
    // create tromino
    this.orientation = 0; 
    this.type = 0;      // #FIX this will be randomized
    
    this.tromino = [];
    this.createNewTromino(parseInt(random(0, 2)));
  }
  
  
  /**
   * Display tromino
   */
  display() {
   for(var i = 0; i < this.tromino.length; i++) {
     this.tromino[i].display();
   }
  }
  
  /**
  * check if blocks in tromino can move left
  *
  * @return {boolean} true if all blocks can move left
  */  
  canMoveLeft() {
    // loop through blocks in tromino and check position
    // in grid to the left is open. 
    for(var i = 0; i < this.tromino.length; i++) {
      let x = this.tromino[i].x - 1;
      let y = this.tromino[i].y;
      let index = x + y * gridWidth;
      
      // if grid space is not available by being out of bounds
      // or not in open state toggle canMoveLeft to false
      if(!this.tromino[i].checkMove(x, y) || cells[index].state == 1) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Move tromino to the left
   */
  moveLeft() {
        
    // if all pieces can move left update all block positions
    // to new left location
    if(this.canMoveLeft()) {
      for(var i = 0; i < this.tromino.length; i++) {
         this.tromino[i].x --;
        this.tromino[i].updatePosition();
      }
    }
  }
  
  /**
  * check if blocks in tromino can move right
  *
  * @return {boolean} true if all blocks can move right
  */ 
  canMoveRight() {
    // loop through blocks in tromino and check position
    // in grid to the right is open. 
    for(var i = 0; i < this.tromino.length; i++) {
      let x = this.tromino[i].x + 1;
      let y = this.tromino[i].y;
      let index = x + y * gridWidth;
      
      // if grid space is not available by being out of bounds 
      // or not in open state toggle canMoveLeft to false
      if(!this.tromino[i].checkMove(x, y) || cells[index].state == 1) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Move tromino to the right
   */
  moveRight() {    
    // if all pieces can move right update all block positions
    // to new right location
    if(this.canMoveRight()) {
      for(var i = 0; i < this.tromino.length; i++) {
        this.tromino[i].x ++;
        this.tromino[i].updatePosition();
      }
    }
  }
  
  /**
  * check if blocks in tromino can move down
  *
  * @return {boolean} true if all blocks can move down
  */ 
  canMoveDown() {
    for(var i = 0; i < this.tromino.length; i++) {
      let x = this.tromino[i].x;
      let y = this.tromino[i].y + 1;
      let index = x + y * gridWidth;
      
      // if grid space is not available by being out of bounds 
      // or not in open state toggle canMoveLeft to false
      if(!this.tromino[i].checkMove(x, y) || cells[index].state == 1) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Move tromino to down
   */
  moveDown() {
   if(this.canMoveDown()) {
     for(var i = 0; i < this.tromino.length; i++) {
        this.tromino[i].y ++;
        this.tromino[i].updatePosition();
      }
   }
  }
  
  /**
   * Rotate Long piece
   */
  rotateLongPiece() {  
    // store current x and y positions for each block in tromino 
    let x0 = this.tromino[0].x;
    let y0 = this.tromino[0].y;
    let x1 = this.tromino[1].x;
    let y1 = this.tromino[1].y;
    let x2 = this.tromino[2].x;
    let y2 = this.tromino[2].y;
    let canMove = true;
    
    // update x and y positions to desired locations for rotation
    switch(this.orientation) {      
      case 0:   
      x0 += 1; y0 += 1;x2 -= 1; y2 -= 1;     
      break;
      case 1:
      x0 -= 1; y0 += 1; x2 += 1; y2 -= 1;      
      break;
      case 2:
      x0 -= 1; y0 -= 1; x2 += 1; y2 += 1;
      break;
      case 3:
      x0 += 1; y0 -= 1; x2 -= 1; y2 += 1;
      break;
      default: break;
    }
    
    // if any of the desired locations are either out of bounds
    // or not in open state trigger canMove to false
    if(!this.tromino[0].checkMove(x0, y0) ||
       !this.tromino[1].checkMove(x1, y1) ||
       !this.tromino[2].checkMove(x2, y2) ) {
      canMove = false;
    }
    
    // if all blocks can move update the current location to the
    // desired location and update position
    if(canMove) {
      this.tromino[0].x = x0;
      this.tromino[0].y = y0;
      this.tromino[0].updatePosition();
      this.tromino[1].x = x1;
      this.tromino[1].y = y1;
      this.tromino[1].updatePosition();
      this.tromino[2].x = x2;
      this.tromino[2].y = y2;
      this.tromino[2].updatePosition();
      
      // increment orientaiton on a succesful rotation
      this.orientation++;
      if(this.orientation > 3) this.orientation = 0;
    }
  }
  

  /**
   * rotate the L Piece
   */
  rotateLPiece() {
    // store current x and y positions for each block in tromino 
    let x0 = this.tromino[0].x;
    let y0 = this.tromino[0].y;
    let x1 = this.tromino[1].x;
    let y1 = this.tromino[1].y;
    let x2 = this.tromino[2].x;
    let y2 = this.tromino[2].y;
    let canMove = true;
    
    // update x and y positions to desired locations for rotation
    switch(this.orientation) {      
      case 0:   
      x0 += 1; y1 -= 1; x2 -= 1;
      break;
      case 1:
      y0 += 1; x1 += 1; y2 -= 1;
      break;
      case 2:
      x0 -= 1; y1 += 1; x2 += 1;
      break;
      case 3:
      y0 -= 1; x1 -= 1; y2 += 1; 
      break;
      default:
      break;
    }

    
    // if any of the desired locations are either out of bounds
    // or not in open state trigger canMove to false
    if(!this.tromino[0].checkMove(x0, y0) ||
       !this.tromino[1].checkMove(x1, y1) ||
       !this.tromino[2].checkMove(x2, y2) ) {
      canMove = false;
    }
    
    // if all blocks can move update the current location to the
    // desired location and update position
    if(canMove) {
      this.tromino[0].x = x0;
      this.tromino[0].y = y0;
      this.tromino[0].updatePosition();
      this.tromino[1].x = x1;
      this.tromino[1].y = y1;
      this.tromino[1].updatePosition();
      this.tromino[2].x = x2;
      this.tromino[2].y = y2;
      this.tromino[2].updatePosition();
      
      // increment orientaiton on a succesful rotation
      this.orientation++;
      if(this.orientation > 3) this.orientation = 0;
    }
  }
  
  /**
   * rotate the irregular long piece
   */
  rotateIrregularLongPiece() {
    // store current x and y positions for each block in tromino 
    let x0 = this.tromino[0].x;
    let y0 = this.tromino[0].y;
    let x1 = this.tromino[1].x;
    let y1 = this.tromino[1].y;
    let x2 = this.tromino[2].x;
    let y2 = this.tromino[2].y;
    let canMove = true;
    
    // update x and y positions to desired locations for rotation
    switch(this.orientation) {      
      case 0:   
      y0 += 2;
      x2 -= 1; 
      y2 -= 1;
      break;
      case 1:
      x0 -= 2; 
      x2 += 1; 
      y2 -= 1;
      break;
      case 2:
      y0 -= 2; 
      x2 += 1; 
      y2 += 1;
      break;
      case 3:
      x0 += 2; 
      x2 -= 1; 
      y2 += 1; 
      break;
      default:
      break;
    }

    
    // if any of the desired locations are either out of bounds
    // or not in open state trigger canMove to false
    if(!this.tromino[0].checkMove(x0, y0) ||
       !this.tromino[1].checkMove(x1, y1) ||
       !this.tromino[2].checkMove(x2, y2) ) {
      canMove = false;
    }
    
    // if all blocks can move update the current location to the
    // desired location and update position
    if(canMove) {
      this.tromino[0].x = x0;
      this.tromino[0].y = y0;
      this.tromino[0].updatePosition();
      this.tromino[1].x = x1;
      this.tromino[1].y = y1;
      this.tromino[1].updatePosition();
      this.tromino[2].x = x2;
      this.tromino[2].y = y2;
      this.tromino[2].updatePosition();
      
      // increment orientaiton on a succesful rotation
      this.orientation++;
      if(this.orientation > 3) this.orientation = 0;
    }
  }
  
  /**
   * rotate the irregular long piece
   */
  rotateIrregularPyramidPiece() {
    // store current x and y positions for each block in tromino 
    let x0 = this.tromino[0].x;
    let y0 = this.tromino[0].y;
    let x1 = this.tromino[1].x;
    let y1 = this.tromino[1].y;
    let x2 = this.tromino[2].x;
    let y2 = this.tromino[2].y;
    let canMove = true;
    
    // update x and y positions to desired locations for rotation
    switch(this.orientation) {      
      case 0:   
      x0 += 1; 
      y0 -= 1;
      x1 += 1;
      y1 += 1;
      x2 -= 1; 
      y2 += 1;
      break;
      case 1:
      x0 += 1; 
      y0 += 1; 
      x1 -= 1;
      y1 += 1;
      x2 -= 1; 
      y2 -= 1;
      break;
      case 2:
      x0 -= 1; 
      y0 += 1; 
      x1 -= 1;
      y1 -= 1;
      x2 += 1; 
      y2 -= 1;
      break;
      case 3:
      x0 -= 1; 
      y0 -= 1; 
      x1 += 1;
      y1 -= 1;
      x2 += 1; 
      y2 += 1;
      break;
      default:
      break;
    }

    
    // if any of the desired locations are either out of bounds
    // or not in open state trigger canMove to false
    if(!this.tromino[0].checkMove(x0, y0) ||
       !this.tromino[1].checkMove(x1, y1) ||
       !this.tromino[2].checkMove(x2, y2) ) {
      canMove = false;
    }
    
    // if all blocks can move update the current location to the
    // desired location and update position
    if(canMove) {
      this.tromino[0].x = x0;
      this.tromino[0].y = y0;
      this.tromino[0].updatePosition();
      this.tromino[1].x = x1;
      this.tromino[1].y = y1;
      this.tromino[1].updatePosition();
      this.tromino[2].x = x2;
      this.tromino[2].y = y2;
      this.tromino[2].updatePosition();
      
      // increment orientaiton on a succesful rotation
      this.orientation++;
      if(this.orientation > 3) this.orientation = 0;
    }
  }
  
  /**
  * Rotate the tromino clockwise
  * call this method generally and the approrpate
  * rotations will occur based on the tromino type/piece
  */
  rotateShape() {
    switch(this.type) {
      case 0: // long piece
      this.rotateLongPiece();
      break;
      case 1: // L piece
      this.rotateLPiece();
      break;
      case 2: 
      this.rotateIrregularLongPiece();
      break;
      case 3:
      this.rotateIrregularPyramidPiece();
      break;
      default:
      break;
    }
  }
  
  /**
  * Method for pushing tromino to larger
  * list of blocks when tromino is set
  */
  pushBlocks(_b) {
    for(var i = 0; i < this.tromino.length; i++) { 
      append(_b, this.tromino[i]);
      
      let index = this.tromino[i].x + this.tromino[i].y * gridWidth;
      cells[index].state = 1;
      
    }
  }
  
  /**
  * begin land animation when piece settles
  */
  startLandAnimation() {
    for (var i = 0; i < this.tromino.length; i++) { 
      this.tromino[i].hasLanded = true;
    }
  }
  
  /**
   * Create new tromino of either long piece, L piece,
   * irregular long piece, or irregular pyramid piece
   *
   * @param {int} _t   the type of tromino to create
   */
  createNewTromino(_t) {
    this.orientation = 0; 
    // this.type = parseInt(random(0, 2));      // 
    this.type = _t;
    
    this.tromino = []
    switch(this.type) {
      case 0: // Long piece
      append(this.tromino, new Block(3, 0, color(246, 210, 174)));
      append(this.tromino, new Block(3, 1, color(246, 210, 174)));
      append(this.tromino, new Block(3, 2, color(246, 210, 174)));
    break;
    case 1: // L piece
      append(this.tromino, new Block(3, 1, color(157, 193, 209)));
      append(this.tromino, new Block(3, 2, color(157, 193, 209)));
      append(this.tromino, new Block(4, 2, color(157, 193, 209)));
    break;
    case 2:
      append(this.tromino, new Block(4, 0, color(61, 98, 124)));
      append(this.tromino, new Block(3, 1, color(61, 98, 124)));
      append(this.tromino, new Block(3, 2, color(61, 98, 124)));
    break;
    case 3:
      append(this.tromino, new Block(2, 2, color(232, 139, 106)));
      append(this.tromino, new Block(3, 1, color(232, 139, 106)));
      append(this.tromino, new Block(4, 2, color(232, 139, 106)));
    break;
    default:
    break;
    } 
  }
}

/**************************************************************
 Class for creating individual blocks that will make up the 
 trominoes.
 **************************************************************/
class Block {
  // int x;          // x location of the block (index)
  // int y;          // y location of the block (index)
  // int xPos;       // x position of the block (pixel)
  // int yPos;       // y position of the block (pixel)
  // int blockSize;  // size of the block
  // color c;        // color fo the block

  
  /**
  * Constructor method for Block class
  *
  * @param {int} _x    the x position of the Cell (index)
  * @param {int} _y    the y position of the Cell (index)
  * @param {int} _c    the color of the block
  */
  constructor(_x, _y, _c) {
    this.x = _x;
    this.y = _y;
    this.blockSize = 50;
    // this.xPos = this.blockSize + this.x * this.blockSize;
    // this.yPos = (this.y * this.blockSize) - (this.blockSize * 3);
    this.xPos = 225 + _x * this.blockSize;
    this.yPos = (0) + (_y * this.blockSize) - 75;
    this.c = _c;
    
    this.hasLanded = false;
    this.landDone = false;
    this.strokeIn = 0;
    this.strokeSpeed = 1;

    this.startClear = false;
    this.stopClear = false;
    this.doneClear = false;
    this.clearTime = 0;
    this.clearFade = 0;
  }
  
  /**
  * Update the pixel position of the block based on x and y position
  */
  updatePosition() {
    // this.xPos = this.blockSize + this.x * this.blockSize;
    // this.yPos = (this.y * this.blockSize) - (this.blockSize * 3);
    this.xPos = 225 + this.x * this.blockSize;
    this.yPos = (0) + (this.y * this.blockSize) - 75;
  }
  
  /**
  * Display the block
  */
  display() {
    // only display if beyond the loading zone
    if(this.y > 2) {
      
      // block land animaton
      if(this.hasLanded && !this.startClear) {
        this.strokeIn += this.strokeSpeed;
        if(this.strokeIn >= 30) {
          this.strokeSpeed *= -1;
        }
        if(this.strokeIn < 0) {
          this.strokeIn = 0;
          this.hasLanded = false; 
        }
      }
      
      // begin clearing block animation
      if(this.startClear) {
        this.clearFade += 1;
        this.strokeIn += 1;
        if(this.clearFade > 30) {
          this.clearFade = 30;
          this.strokeIn = 30;
          this.stopClear = true;
          this.startClear = false;
          this.clearTIme = millis();
        }
      }
      
      // clear delay trigger
      if(this.stopClear && millis() > this.clearTime + 400) {
        this.doneClear = true;
      }
      
    fill(this.c);
    stroke(115, 138, 152);
    if(gameOver || gameScreen == 2) {
      fill(red(this.c), green(this.c), blue(this.c), 75);
    }
    rect(this.xPos, this.yPos, this.blockSize, this.blockSize, 5);
      
      fill(255, map(this.clearFade, 0, 30, 0, 255));
      stroke(255, map(this.strokeIn, 0, 30, 0, 255));
      strokeWeight(map(this.strokeIn, 0, 30, 1, 3));
      rect(this.xPos, this.yPos, this.blockSize, this.blockSize, 5);
      strokeWeight(1);
    }
  }  
  
  /**
  * Method for checking if block can move to the
  * desired location in the grid based 
  * 
  * @param {int} _x      the x location in grid
  * @param {int} _y      the y location in grid
  *
  * @return {boolean}    if grid space is open returns true. else false
  */
  checkMove(_x, _y) {
    // check if within bounds of grid
    if(_x < 0 || _x > gridWidth - 1 ||
       _y < 0 || _y > gridHeight - 1) {
       return false;
    }
    // check the grid cell is open (no other block)
    let index = _x + _y * gridWidth;
    if(cells[index].state == 1) {
      return false;
    }
    return true;
  }
}

/**************************************************************
 Class for creating cells that make the up the game grid.
 #FIX not sure if this is needed as it can be just an Integer
 array decalring if space in grid is open or has a block in it.
 
 However for design things different colors or effects can be
 used in the cells. 

 **************************************************************/
class Cell {
  //var x;            // x location of cell (index)
  //var y;            // y location of cell (index)
  //var xPos;         // x position of cell (pixel)
  //var yPos;         // y position of cell (pixel)
  //var state;        // track if cell is empty (0 = empty | 1 = block)
  //var cellSize;     // size of the cell
  
  /**
  * Constructor method for Block class
  *
  * @param {int} _x    the x position of the Cell (index)
  * @param {int} _y    the y position of the Cell (index)
  * @param {int} _s    the size of the cell
  */
  constructor(_x, _y, _s) {
    this.x = _x;
    this.y = _y;
    this.cellSize = 50;
    // this.xPos = this.cellSize + this.x * this.cellSize;
    // this.yPos = (this.y * this.cellSize) - (this.cellSize * 3);
    this.xPos = 225 + _x * this.cellSize;
    this.yPos =  (_y * this.cellSize) - 75;
    this.state = _s;
  }
  
  /**
  * Display the block depending on state
  */
  display() {
    if(this.y > 2) {
      fill(208,210, 205);
      noStroke();
      rect(this.xPos, this.yPos, this.cellSize, this.cellSize);
    }
  } 
}





/*
* Class for create delay auto shifts for triggers
 */
class DAS {
  // boolean engaged; // The event that engages the trigger 
  // boolean active; // Provides way of perform commands when true outside of class
  // int timerDAS = millis(); // The running DAS timer
  // int timerDelay = millis(); // The running short delay timer
  // int amtDAS = 500; // Amount of DAS delay
  // int amtDelay = 50; // Amount of short delay
  // int stateDAS = 0; // State of DAS

  // Constructor
  constructor() {
    this.engaged = false;
    this.active = false;
    this.amtDAS = 500;
    this.amtDelay = 50;
    this.stateDAS = 0;
    this.timerDAS = millis();
    this.timerDelay = millis();
  }

  // Method that checks if the trigger is engaged
  update() {
    if (this.engaged) {
      this.checkActive();
    } else {
      this.active = false;
      this.stateDAS = 0;
    }
  }

  // Returns true when appropriate throuhg
  // delayed auto shift 
  checkActive() {
    this.active = false;
    switch(this.stateDAS) {
      // Active on first trigger
    case 0:
      this.active = true;
      this.stateDAS++;
      this.timerDAS = millis();
      break;
      // Peform DAS on sustained trigger
    case 1:
      this.active = false;
      if (millis() > this.timerDAS + this.amtDAS) {
        this.stateDAS++;
      }
      break;
      // Repeated active at amtDelay
    case 2:
      if (millis() > this.timerDelay + this.amtDelay) {
        this.active = true;
        this.timerDelay = millis();
      }
      break;
    default:
      break;
    }
    // return active state
    return this.active;
  }
}



