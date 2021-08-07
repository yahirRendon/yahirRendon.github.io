/**************************************************************
 Project:  scripts page for portfolio implementation of my
           version of Conway's game of life
 Author:   Yahir
 Date:     April 2021
 
 **************************************************************/

/**
 * On windowload check navigaton display and
 * set onClick listeners
 */
window.onload = function () {
	navigationBarToggle();
}

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
 Project:  My version of Conway's Game of Life using a minimal 
           design, circle packing,and a heat map to show how 
           long cells are in living state. 
 Author:   Yahir
 Date:     April 2021
 
 Notes:
 - Mouse over canvas to reveal selectable cells
 - Left click to select a cell
 - Control key to toggle selection and deselection of cells
 - 'S' key to toggle between evolve and static states
 - 'C' key to clear the cells
 
 **************************************************************/
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
let light;                // grid layout reveal color

/**************************************************************
 SET UP METHOD
 **************************************************************/
function setup() {
  var parentWidth = document.getElementById('p5Canvas').offsetWidth;
  var parentHeight = document.getElementById('p5Canvas').offsetHeight;
	
  var canvas = createCanvas(800, 800);
 
  // Move the canvas so it’s inside div with id="p5Canvas">.
  canvas.parent('p5Canvas');

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
  for(var y = 0; y < rows; y++) {
    for(var x = 0; x < cols; x++) {
      board[x][y] = createVector(x, y, 0);
      nextBoard[x][y] = createVector(x, y, 0);
      boardData[x][y] = createVector(0, 0, 0);
    }
  }
}

/**************************************************************
 DRAW METHOD
 **************************************************************/
function draw() {
  background(235, 237, 239);
  noStroke();
  
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

// Select cells on left mouse click
function mouseClicked() {
  if(mouseButton == LEFT) {
    mClicked = true;
  }
}

/**************************************************************
 KEY PRESSED
 
 - CONTROL KEY : toggle selecting or deselecting cells
 **************************************************************/
function keyPressed() {
  // select vs deselect cells
	if(keyCode == CONTROL) {
		ctrl = !ctrl;
	}
}

/**************************************************************
 KEY TYPED
 
 - S KEY : toggles evolving board and a static board
 - C KEY : clear/reset the board
 **************************************************************/
function keyTyped() {
  // 's' or 'S' to toggle between static and evolving board
  if(key == 's' || key == 'S') {
    evolveBoard = !evolveBoard;
    counter = 0;
  }

  // 'C' or 'c' clear the board 
  if(key == 'c' || key == 'C') {
    for(var y = 0; y < rows; y++) {
      for(var x = 0; x < cols; x++) {
        board[x][y] = createVector(x, y, 0);
        boardData[x][y] = createVector(0, 0, 0);
      }
    }
  }
}

/**
 * function for evovling through various states of board based on rules
 */
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