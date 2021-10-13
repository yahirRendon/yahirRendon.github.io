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
		resetGrid();
	})
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
 Project:  My version of a Minesweeper clone. Converted from 
           a java version developed for Processing
 Author:   Yahir
 Date:     October 2021
 
 Notes:
 - LEFT CLICK on cell to reveal
 - SHIFT + LEFT CLICK to place a flag
 - PRESS reset button to reset grid
 
 **************************************************************/

let cells = [];         // cell grid
let mines = [];         // ine location in index

var gameLost;           // track if game won
var gameWon;            // track if game lost
let flagsPlaced;

// set color palette
let base;
let mine;
let closed;
let opened;
let flagged;
let dark;

/**************************************************************
 SET UP METHOD
 **************************************************************/
function setup() {
  // set up canvas
  var parentWidth = document.getElementById('p5Canvas').offsetWidth;
  var parentHeight = document.getElementById('p5Canvas').offsetHeight;
  var canvas = createCanvas(800, 800);
 
  // Move the canvas so it’s inside div with id="p5Canvas">.
  canvas.parent('p5Canvas');
  
  
  // set initial values
  base = color(244, 233, 227);
  mine = color(244, 210, 208);
  closed = color(201, 211, 223);
  opened = color(228, 233, 236);
  flagged = color(158, 174, 197);
  dark = color(121, 125, 161);
  
  resetGrid();
  
  textAlign(CENTER, CENTER);

}

/**************************************************************
 DRAW METHOD
 **************************************************************/
function draw() {
  background(base);
  
  for(var i = 0; i < cells.length; i++) {
    cells[i].display();
  }
}

/**************************************************************
 MOUSEPRESSED PRESSED
 
 - LEFT CLICK
 - SHEFT + LEFT CLICK
 **************************************************************/
function mouseClicked() {
  if(mouseButton == LEFT) {
    if(keyIsDown(SHIFT)) {
      checkFlag();
      shiftPressed = false;
    } else {
      cellSelected();
      if(!gameWon) {
        checkGameWon();
      } 
    }
  }
}

/**
 * Check which cell has been selected and whether to open it
 * if the game has be won or lost
 */
function cellSelected() {
  for(var i = 0; i < cells.length; i++) {
    if(cells[i].active()) {
      if(!cells[i].getFlag()) {
        cells[i].setState(0); 
      }
      if(cells[i].getType() == -1 && !cells[i].getFlag()) {
        gameLost = true;
      }
      else if(cells[i].getNumMines() == 0 && !cells[i].getFlag()) {
        checkNeighbor(i);     
      }
    }
  }
}

/**
 * Check which neighbors to reveal when clicking on a cell using recursion
 *
 * @param {int} _i   the index position of the cell (x + y * gridWidth)
 */
function checkNeighbor(i) {
  var cellX = int(cells[i].cellX);
  var cellY = int(cells[i].cellY);
  for(var yy = -1; yy < 2; yy++) {
    for(var xx = -1; xx < 2; xx++) {    
      if(xx + cellX > -1 && xx + cellX < 6 && 
         yy + cellY > -1 && yy + cellY < 6){
        var inIndex = (cellX + xx) + (cellY + yy) * 6;     
        if(cells[inIndex].getState() == 1 && cells[inIndex].getType() == 0) {
          if(cells[inIndex].getNumMines() == 0) {
            if(!cells[inIndex].getFlag()) {
              cells[inIndex].setState(0);
              checkNeighbor(inIndex);
            }
          } else {
            cells[inIndex].setState(0);
          }
        }
      }    
    }
  }
}

/**
 * Check if the game has been won by counter the number of cells left
 */
function checkGameWon() {
  var num = 0;
  for(var i = 0; i < cells.length; i++) {
    if(cells[i].getState() == 1) {
      num++;
    }
  }
  if(num == 6) {
    gameWon = true;
  }
}

/**
 * Reset/Create the grid, place mines, and calcuate neighboring mines
 */
function resetGrid() {
  cells = [];
  mines = [];
  gameWon = false;
  gameLost = false;
  flagsPlaced = 0;
  
  // generate mines within grid
  while(mines.length < 6) {
    var tempRand = int(random(0, 36));
    if(mines.length == 0) {
      append(mines, tempRand);
    } else {
      var newCellPosition = true;
      for(var i = 0; i < mines.length; i++) {
        if(tempRand == int(mines[i])) {
          newCellPosition = false;
        }
      }
      if(newCellPosition) {
        append(mines, tempRand);
      }
    }
  }
  
  // create cell board
  for(var y = 0; y < 6; y++) {
    for(var x = 0; x < 6; x++) {
      var index = x + y * 6;
      append(cells, new Cell(x, y));
      for(var i = 0; i < mines.length; i++) {
        if(index == int(mines[i])) {
          cells[index].setType(-1);
        }
      }
    }
  }
  
  // check cell neighbors
  for(var y = 0; y < 6; y++) {
    for(var x = 0; x < 6; x++) {
      var index = x + y * 6;
      var numMines = 0;
      for(var yy = -1; yy < 2; yy++) {
        for(var xx = -1; xx < 2; xx++) {       
          if(xx + x > -1 && xx + x < 6 && yy + y > -1 && yy + y < 6){
            var inIndex = (x + xx) + (y + yy) * 6;
            if(inIndex != index && cells[inIndex].getType() == -1) {
              numMines ++;
            }
          }         
        }
      }
    cells[index].setNumMines(numMines);
    }
  } 
}

/**
 * Check whether to set flag
 */
function checkFlag() {
   for(var i = 0; i < cells.length; i++) {
    if(cells[i].active() && cells[i].getState() != 0 && flagsPlaced < 6) {
      cells[i].setFlag();
      if(cells[i].getFlag()) {
        flagsPlaced++;     
      } else {
        flagsPlaced--;
      }     
    }
  }
}

/**************************************************************
 Class for creating a cell that will make up the game grid. 
 The cell will be:
 - open or closed
 - contain a mine or not
 - flagged or not flagged
 - inform of number of neighboring mines
 **************************************************************/
class Cell {
  
 /**
  * Constructor method for Cell class
  *
  * @param {int} _x    the x position of the Cell (index)
  * @param {int} _y    the y position of the Cell (index)
  */
 constructor(_x, _y) {
    this.cellX = _x;                              // the x position of cell (index)
    this.cellY = _y;                              // the y position of cell (index)
    this.cellSize = 120;                          // the size of the cell
    this.x = 40 + (_x * this.cellSize);           // the x position of cell (pixel)
    this.y = 40 + (_y * this.cellSize);           // the y position of cell (pixel)
    this.cellType = 0;                            // empty or mine (0 | -1)
    this.cellState = 1;                           // open or closed (1 | 0)
    this.numMines = 0;                            // the number of neighboring mines
    this.flag = false;                            // cell flagged
    
    // reset animation
    this.delayCounter = 0;
    this.delayAmount = int(random(75, 100));
    this.dCol = 0;
  }
  
  /**
   * Setter methods
   */
  setType(_t) {
    this.cellType = _t;
  }
  setState(_s) {
    this.cellState = _s;
  }
  setNumMines(_n) {
    this.numMines = _n;
  }
  setFlag() {
    this.flag = !this.flag;
  }
    
  /**
   * Getter methods
   */
  getType() {
    return this.cellType;
  }
  getState() {
    return this.cellState;
  }
  getNumMines() {
    return this.numMines;
  }
  getFlag() {
    return this.flag;
  }
  
  /**
   * Display the Cell
   */
  display() {  
    if(this.delayCounter < this.delayAmount) {
      // fade in animation
      var targetVal = this.delayAmount;
      var dx = targetVal - this.delayCounter;
      this.dCol += dx * 0.05;
      stroke(255, this.dCol);
      fill(red(closed), green(closed), blue(closed), this.dCol);
      this.delayCounter++;
    } else {
      fill(closed);
      stroke(255);
      if(this.cellState == 0) {
        fill(opened);
      } 
      if(this.flag) {
        fill(flagged);
      }
    }
    rect(this.x, this.y, this.cellSize, this.cellSize, 10);
    
    // display number of neighboring mines
    fill(dark);
    textSize(28);
    if(this.cellState == 0 && this.numMines > 0 ) {
    text(this.numMines, this.x + (this.cellSize/2), this.y + (this.cellSize/2) +  0);
    }
    
    // display mine
    if(this.cellType == -1) {
      if(gameLost) {
        fill(mine);
        ellipse(this.x + (this.cellSize/2), this.y + (this.cellSize/2), 60, 60);
      } else 
      if(gameWon) {
        fill(red(mine), green(mine), blue(mine), 100);
        ellipse(this.x + (this.cellSize/2), this.y + (this.cellSize/2), 60, 60);
      }
    }  
  }
   
  /**
   * check if mouse is over cell
   */
  active() {
   if(mouseX > this.x && mouseX < this.x + this.cellSize &&
      mouseY > this.y && mouseY < this.y + this.cellSize) {
       return true;
     } else {
       return false;
     }
  }
}