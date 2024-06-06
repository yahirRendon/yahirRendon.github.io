
/******************************************************************************
*
* javascript for game of life
* 
*****************************************************************************/
const selectToggleButton = document.getElementById('button-p5-1');
const staticToggleButton = document.getElementById('button-p5-2');
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
*
* Turn off default functionaliity of space and arrow keys
* 
*****************************************************************************/
window.addEventListener("keydown", function (e) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

/******************************************************************************
 * p5.js sketch
 * 
 * Project:  My version of Conway's Game of Life using a minimal design, 
 * circle packing,and a heat map to show how 
 * long cells are in living state. 
 * 
 * Author:   Yahir
 * 
 * Notes:
 * - Mouse over canvas to reveal selectable cells
 * - Left click to select a cell
 * - us html buttons to select/deselect | evovle/static | reset
 * 
 *****************************************************************************/
var myFont;
var parentWidth;

let board = [[]];         // 2D Array for holding board x & y position and space state
// [][].x = x pos, [][].y = y pos, [][].z = space state
let nextBoard = [[]];     // 2D array generating future/next board state
let boardData = [[]];     // 2D array holding heatmap value and potential other details
// [][].x = heatmap

let cols;                 // number of board/grid columns
let rows;                 // number of board/grid rows
let cellSize;             // size of individual cell size making up board
var mClicked;             // track left mouse clicked
var ctrl;                 // toggle control key for deselecting and selecting
var evolveBoard;          // boolean toggling board evolotion or static

var evolveCounter;        // counter used for frame based delay

// Color palette 
let dark;                 // selected cell color              
let bright;               // heat map color
let light;


/******************************************************************************
 * 
 * Preload assessts prior to running setup function
 * 
 *****************************************************************************/
function preload() {
    myFont = loadFont('../assets/Poppins-Light.ttf');
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

    // Set intials variable values
    cols = 17;
    rows = 19;
    cellSize = 50;
    mClicked = false;
    ctrl = false;
    evolveBoard = false;
    evolveCounter = 0;

    // Set color palette
    light = color(212, 208, 175);
    bright = color(255, 0, 221);
    dark = color(144, 167, 196);

    // Initialize 2D array for board
    board = new Array(cols);
    for (let i = 0; i < cols; i++) {
        board[i] = new Array(rows);
    }

    // Initialize 2D array for future/next board
    nextBoard = new Array(cols);
    for (let i = 0; i < cols; i++) {
        nextBoard[i] = new Array(rows);
    }

    // Initialize 2D array for heatmap
    boardData = new Array(cols);
    for (let i = 0; i < cols; i++) {
        boardData[i] = new Array(rows);
    }

    // Populate 2D arrays
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            board[x][y] = createVector(x, y, 0);
            nextBoard[x][y] = createVector(x, y, 0);
            boardData[x][y] = createVector(0, 0, 0);
        }
    }

}

/******************************************************************************
 * 
 * draw canvas
 * 
 *****************************************************************************/
function draw() {
    background(233, 235, 235);
    noStroke();
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

    // Check if board is going to evolve or is static
  if(evolveBoard) { 
    // Increment counter
    evolveCounter++;
    if(evolveCounter > 60) {
      evolve();  
      evolveCounter = 0;
    }
  }
  
  // Loop through each space in board except edges
  for(var y = 1; y < rows -1; y++) {
    for(var x = 1; x < cols-1; x++) {
      // Hold assigned x and y center of board spaces
      // Hold the state of the board piece
      var xx = 0;
      var yy = 0;
      var state = 0;
      
      // Create circle packed board
      if(y % 2 == 0) {
        xx = (board[x][y].x * 50) + 10;
        yy = (board[x][y].y * 45) + 0;

      } else {
        xx = (board[x][y].x * 50) - 15;
        yy = (board[x][y].y * 45) + 0;
      }
      
      // Update value of board space if selected
      // mouse pos is within range of board space and clicked
      var d = dist(mouseX, mouseY, xx, yy);
      if(d < 25) {
		  if(mClicked && ctrl) {
			board[x][y].z = 0;
		  } else if(mClicked) {
		    board[x][y].z = 1;
		  }
      }         
      
      // Store state of board space
	  state = board[x][y].z;
	  
	  var mc = map(boardData[x][y].x, 0, 6000, 0, 255);
		fill(red(bright), green(bright), blue(bright), mc) // bright color
		ellipse(xx, yy, cellSize, cellSize);
      
      // Visually display state of board space
      // dead or not selected
      if(state == 1) {      
        
        // Display selected or alive cells
        fill(dark)
        ellipse(xx, yy, cellSize, cellSize);
        
        // Increment heatmap for alive cells
        if(evolveBoard) {
          boardData[x][y].x++;
          // Set heatmap limit
          if(boardData[x][y].x > 6000) {
            boardData[x][y].x = 6000;
          }
        }
      }
      
      // Create a simple guide for revealing grid
      if(d < 150 && !evolveBoard && state == 0) {
        var dm = map(d, 0, 150, cellSize, 0);        
        fill(light);
        ellipse(xx, yy, dm, dm)
      }
    }
  }
  
  // Reset mouseClick boolean
  mClicked = false;

}


/**************************************************************
 * 
 * KEY PRESSED
 * 
 * - CONTROL KEY : toggle selecting or deselecting cells
 **************************************************************/
// function keyPressed() {
//   // select vs deselect cells
// 	if(keyCode == CONTROL) {
// 		ctrl = !ctrl;
// 	}
// }

/**************************************************************
 * KEY TYPED
 * 
 * - S KEY : toggles evolving board and a static board
 * - C KEY : clear/reset the board
 **************************************************************/
//  function keyTyped() {
//   // 's' or 'S' to toggle between static and evolving board
//   if(key == 's' || key == 'S') {
//     evolveBoard = !evolveBoard;
//     counter = 0;
//   }

//   // 'C' or 'c' clear the board 
//   if(key == 'c' || key == 'C') {
//     for(var y = 0; y < rows; y++) {
//       for(var x = 0; x < cols; x++) {
//         board[x][y] = createVector(x, y, 0);
//         boardData[x][y] = createVector(0, 0, 0);
//       }
//     }
//   }
// }

// Select cells on left mouse click
function mouseClicked() {
  if(mouseButton == LEFT) {
    mClicked = true;
  }
}

function resetBoard() {
  for(var y = 0; y < rows; y++) {
    for(var x = 0; x < cols; x++) {
      board[x][y] = createVector(x, y, 0);
      boardData[x][y] = createVector(0, 0, 0);
    }
  }
}

/******************************************************************************
 * 
 * function for evovling through various states of board based on rules
 *
 *****************************************************************************/
function evolve() {
  // loop through every spot in 2D array and check neighbors states
  for (let x = 1; x < cols - 1; x++) {
    for (let y = 1; y < rows - 1; y++) {
      // loop to add up the surrounding cell states
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          neighbors += board[x+i][y+j].z;
        }
      }

      // remove current cell state (counted above loop)
      neighbors -= board[x][y].z;
      // rules of Life:
      // loneliness
      if((board[x][y].z == 1) && (neighbors <  2)) {
        nextBoard[x][y].z = 0;       
      }
      // overpopulation
      else if((board[x][y].z == 1) && (neighbors >  3)) {
        nextBoard[x][y].z = 0;       
      }
      // reproduction
      else if((board[x][y].z == 0) && (neighbors == 3)) {
        nextBoard[x][y].z = 1;       
      }
      // homeostasis
      else {                                             
        nextBoard[x][y].z = board[x][y].z; 
      }
    }
  }

  // swap board to next/future board
  let temp = board;
  board = nextBoard;
  nextBoard = temp;
}

/******************************************************************************
*
* p5 button events
* 
*****************************************************************************/
/******************************************************************************
*
* toggle select and deselcting cells on button
* 
*****************************************************************************/
selectToggleButton.addEventListener('click', function() {
  
  ctrl = !ctrl;
  // update image for user feedback
  let symbolElement = document.getElementById('p5-button-1-symbol');
  if(ctrl) {
    symbolElement.innerHTML = "&#10539"
  } else {
    symbolElement.innerHTML ="&#11096"
  }
});

/******************************************************************************
*
* toggle evolving the board and static mode
* 
*****************************************************************************/
staticToggleButton.addEventListener('click', function() {
    evolveBoard = !evolveBoard;
    counter = 0;

    let symbolElement = document.getElementById('p5-button-2-symbol');
    if(evolveBoard) {
      symbolElement.innerHTML = "&#8414"
    } else {
      symbolElement.innerHTML ="&#9655"
    }
   
});

/******************************************************************************
*
* reset game when button clicked
* 
*****************************************************************************/
resetGameButton.addEventListener('click', function() {
  resetBoard();
  evolveBoard = false;
});
