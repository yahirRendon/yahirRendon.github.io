//=============================================================================
// scripts for sweeper game
//=============================================================================
const menuButton = document.getElementById('menu-button');
const topButton = document.getElementById('top-button');
const resetGameButton = document.getElementById('button-p5-2');

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
document.getElementById('top-button').addEventListener('click', function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
})


//=============================================================================
// p5.js sketch
//=============================================================================

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
var fontMontserrat;
var parentWidth;
var cells = [];         // cell grid
var mines = [];         // ine location in index
var gameLost;           // track if game won
var gameWon;            // track if game lost
var flagsPlaced;
// set color palette
let base;
let mine;
let closed;
let opened;
let flagged;
let dark;

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


    // set initial values
    base = color(244, 233, 227);
    mine = color(244, 210, 208);
    closed = color(201, 211, 223);
    opened = color(228, 233, 236);
    flagged = color(158, 174, 197);
    dark = color(121, 125, 161);

    resetGrid();

}

/******************************************************************************
 * 
 * draw canvas
 * 
 *****************************************************************************/
function draw() {
    background(base);

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

    
    for (var i = 0; i < cells.length; i++) {
        cells[i].display();
    }

}

/******************************************************************************
 * MOUSEPRESSED PRESSED
 * 
 * LEFT CLICK             | reveal cell
 * SHIFT + LEFT CLICK     | flag cell
 *****************************************************************************/
function mouseClicked() {
    if (mouseButton == LEFT) {
        if (keyIsDown(SHIFT)) {
            checkFlag();
            shiftPressed = false;
        } else {
            cellSelected();
            if (!gameWon) {
                checkGameWon();
            }
        }
    }
}

/******************************************************************************
 * Check which cell has been selected and whether to open it
 * if the game has be won or lost
 *****************************************************************************/
function cellSelected() {
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].active()) {
            if (!cells[i].getFlag()) {
                cells[i].setState(0);
            }
            if (cells[i].getType() == -1 && !cells[i].getFlag()) {
                gameLost = true;
            }
            else if (cells[i].getNumMines() == 0 && !cells[i].getFlag()) {
                checkNeighbor(i);
            }
        }
    }
}

/******************************************************************************
 * Check which neighbors to reveal when clicking on a cell using recursion
 *
 * @param {int} _i   the index position of the cell (x + y * gridWidth)
 *****************************************************************************/
function checkNeighbor(i) {
    var cellX = int(cells[i].cellX);
    var cellY = int(cells[i].cellY);
    for (var yy = -1; yy < 2; yy++) {
        for (var xx = -1; xx < 2; xx++) {
            if (xx + cellX > -1 && xx + cellX < 6 &&
                yy + cellY > -1 && yy + cellY < 6) {
                var inIndex = (cellX + xx) + (cellY + yy) * 6;
                if (cells[inIndex].getState() == 1 && cells[inIndex].getType() == 0) {
                    if (cells[inIndex].getNumMines() == 0) {
                        if (!cells[inIndex].getFlag()) {
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

/******************************************************************************
 * 
 * Check if the game has been won by counter the number of cells left
 * 
 *****************************************************************************/
function checkGameWon() {
    var num = 0;
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].getState() == 1) {
            num++;
        }
    }
    if (num == 6) {
        gameWon = true;
    }
}

/******************************************************************************
 * 
 * Reset/Create the grid, place mines, and calcuate neighboring mines
 * 
 *****************************************************************************/
function resetGrid() {
    cells = [];
    mines = [];
    gameWon = false;
    gameLost = false;
    flagsPlaced = 0;

    // generate mines within grid
    while (mines.length < 6) {
        var tempRand = int(random(0, 36));
        if (mines.length == 0) {
            append(mines, tempRand);
        } else {
            var newCellPosition = true;
            for (var i = 0; i < mines.length; i++) {
                if (tempRand == int(mines[i])) {
                    newCellPosition = false;
                }
            }
            if (newCellPosition) {
                append(mines, tempRand);
            }
        }
    }

    // create cell board
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            var index = x + y * 6;
            append(cells, new Cell(x, y));
            for (var i = 0; i < mines.length; i++) {
                if (index == int(mines[i])) {
                    cells[index].setType(-1);
                }
            }
        }
    }

    // check cell neighbors
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            var index = x + y * 6;
            var numMines = 0;
            for (var yy = -1; yy < 2; yy++) {
                for (var xx = -1; xx < 2; xx++) {
                    if (xx + x > -1 && xx + x < 6 && yy + y > -1 && yy + y < 6) {
                        var inIndex = (x + xx) + (y + yy) * 6;
                        if (inIndex != index && cells[inIndex].getType() == -1) {
                            numMines++;
                        }
                    }
                }
            }
            cells[index].setNumMines(numMines);
        }
    }
}

/******************************************************************************
 * 
 * Check whether to set flag
 * 
 *****************************************************************************/
function checkFlag() {
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].active() && cells[i].getState() != 0 && flagsPlaced < 6) {
            cells[i].setFlag();
            if (cells[i].getFlag()) {
                flagsPlaced++;
            } else {
                flagsPlaced--;
            }
        }
    }
}

/******************************************************************************
* Class for creating a cell that will make up the game grid. 
* The cell will be:
* - open or closed
* - contain a mine or not
* - flagged or not flagged
* - inform of number of neighboring mines
 *****************************************************************************/
class Cell {

    /**
     * Constructor method for Cell class
     *
     * @param {int} _x    the x position of the Cell (index)
     * @param {int} _y    the y position of the Cell (index)
     *****************************************************************************/
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

    /******************************************************************************
     * 
     * Setter methods
     * 
     *****************************************************************************/
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

    /******************************************************************************
     * 
     * Getter methods
     * 
     *****************************************************************************/
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

    /******************************************************************************
     * 
     * Display the Cell
     * 
     *****************************************************************************/
    display() {
        if (this.delayCounter < this.delayAmount) {
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
            if (this.cellState == 0) {
                fill(opened);
            }
            if (this.flag) {
                fill(flagged);
            }
        }
        rect(this.x, this.y, this.cellSize, this.cellSize, 10);

        // display number of neighboring mines
        fill(dark);
        textSize(28);
        if (this.cellState == 0 && this.numMines > 0) {
            text(this.numMines, this.x + (this.cellSize / 2), this.y + (this.cellSize / 2) + 0);
        }

        // display mine
        if (this.cellType == -1) {
            if (gameLost) {
                fill(mine);
                ellipse(this.x + (this.cellSize / 2), this.y + (this.cellSize / 2), 60, 60);
            } else
                if (gameWon) {
                    fill(red(mine), green(mine), blue(mine), 100);
                    ellipse(this.x + (this.cellSize / 2), this.y + (this.cellSize / 2), 60, 60);
                }
        }
    }

    /******************************************************************************
    * 
    * check if mouse is over cell
    * 
    *****************************************************************************/
    active() {
        if (mouseX > this.x && mouseX < this.x + this.cellSize &&
            mouseY > this.y && mouseY < this.y + this.cellSize) {
            return true;
        } else {
            return false;
        }
    }
}

//=============================================================================
// p5 button events
//=============================================================================

/******************************************************************************
 * 
* reset game when button clicked
* 
*****************************************************************************/
resetGameButton.addEventListener('click', function() {
    resetGrid();
});
