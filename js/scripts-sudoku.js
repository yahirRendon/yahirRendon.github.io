/******************************************************************************
*
* javascript for SUDOKU SKETCH
* 
*****************************************************************************/

/******************************************************************************
 * DOM references and global state
 *****************************************************************************/

// difficulty button
const button1 = document.getElementById('button-p5-1');
const button1Symbol = document.getElementById('p5-button-1-symbol');

// reset button
const resetGameButton = document.getElementById('button-p5-3');

// overlay elements
const inputOverlay = document.getElementById('input-overlay');
const overlayNumberButtons = document.querySelectorAll('.overlay-num-btn');
const overlayCancelButton = document.getElementById('overlay-cancel');
const overlayClearButton = document.getElementById('overlay-clear');

// mistake counter display (slot 2)
const mistakesDisplay = document.getElementById('mistake-count');

// mistake state
var mistakeCount = 0;

// celebration / pulse state
var isPulsing = false;


/******************************************************************************
 * p5.js sketch:
 *
 *****************************************************************************/

// font
var myFont;

// layout / sizing
var parentWidth;
var canvasSize;
var cellSize;
var GRID_SIZE = 9;

// colors
var base;       // background
var gridLine;   // grid lines
var cellBase;   // normal cell background
var cellHover;  // hover or selected
var cellError;  // invalid cells
var textGiven;  // given numbers
var textUser;   // user numbers;

// game state
var sudokuGrid = null;    // SudokuGrid instance
var selectedCell = null;  // currently selected SudokuCell
var currentDifficulty = "easy";

// base puzzle generation
var baseSolution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// randomized version used for this game
var currentSolution = null;


/******************************************************************************
 * Preload assets prior to running setup function
 *****************************************************************************/
function preload() {
    myFont = loadFont('../assets/Poppins-Light.ttf');
}


/******************************************************************************
 * Set up canvas
 *****************************************************************************/
function setup() {

    // get parent width and set canvas size
    parentWidth = document.getElementById('p5-canvas').offsetWidth;

    // canvas is a square; limit height usage a bit for smaller screens
    canvasSize = parentWidth;
    if (windowHeight < canvasSize) {
        canvasSize = windowHeight * 0.8;
    }

    var canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent('p5-canvas');

    textAlign(CENTER, CENTER);
    textFont(myFont);

    base      = color(233, 235, 235);   // background
    gridLine  = color(121, 125, 161);   // darker grid lines

    cellBase  = color(228, 233, 236);   // normal cell
    cellHover = color(201, 211, 223);   // selected
    cellError = color(244, 210, 208);   // invalid entries

    textGiven = color(121, 125, 161);   // pre-filled numbers
    textUser  = color(90, 95, 120);     // user-entered numbers

    // initial game setup
    newGame(currentDifficulty);
}

/******************************************************************************
 * Handle window resize event
 *****************************************************************************/
function windowResized() {
    parentWidth = document.getElementById('p5-canvas').offsetWidth;

    canvasSize = parentWidth;
    if (windowHeight < canvasSize) {
        canvasSize = windowHeight * 0.8;
    }

    resizeCanvas(canvasSize, canvasSize);

    cellSize = width / GRID_SIZE;
}

/******************************************************************************
 * Initialize a new game at a given difficulty
 *****************************************************************************/
function newGame(diff) {
    currentDifficulty = diff;
    isPulsing = false;

    // generate a new randomized full solution
    currentSolution = generateRandomSolution();

    // generate a new puzzle based on difficulty
    updateDifficultySymbol();
    var puzzle = getPuzzleForDifficulty(currentDifficulty);
    
    sudokuGrid = new SudokuGrid(puzzle);

    cellSize = width / GRID_SIZE;
    selectedCell = null;
    closeInputOverlay();
    resetMistakes();
}

/******************************************************************************
 * Generate a randomized valid Sudoku solution from baseSolution
 * using only Sudoku-preserving transformations:
 *  - digit permutation
 *  - row swaps within bands
 *  - column swaps within stacks
 *  - band swaps (row bands)
 *  - stack swaps (column stacks)
 *  - optional transpose
 *****************************************************************************/
function generateRandomSolution() {

    var grid = cloneGrid(baseSolution);

    // random digit permutation: shuffled 1-9
    var digits = [1,2,3,4,5,6,7,8,9];
    for (let i = digits.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = digits[i];
        digits[i] = digits[j];
        digits[j] = tmp;
    }
    // build map oldDigit to newDigit
    var digitMap = {};
    for (let d = 1; d <= 9; d++) {
        digitMap[d] = digits[d - 1];
    }
    // apply digit map
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let v = grid[r][c];
            grid[r][c] = digitMap[v];
        }
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // swap rows within each band (3-row group) a few times
    for (let band = 0; band < 3; band++) {
        let start = band * 3;
        for (let k = 0; k < 3; k++) {
            let r1 = start + randInt(0, 2);
            let r2 = start + randInt(0, 2);
            if (r1 !== r2) {
                swapRows(grid, r1, r2);
            }
        }
    }

    // swap columns within each stack (3-column group) a few times
    for (let stack = 0; stack < 3; stack++) {
        let start = stack * 3;
        for (let k = 0; k < 3; k++) {
            let c1 = start + randInt(0, 2);
            let c2 = start + randInt(0, 2);
            if (c1 !== c2) {
                swapCols(grid, c1, c2);
            }
        }
    }

    // swap entire row bands (0–2, 3–5, 6–8)
    for (let k = 0; k < 2; k++) {
        let b1 = randInt(0, 2);
        let b2 = randInt(0, 2);
        if (b1 !== b2) {
            let rStart1 = b1 * 3;
            let rStart2 = b2 * 3;
            for (let i = 0; i < 3; i++) {
                swapRows(grid, rStart1 + i, rStart2 + i);
            }
        }
    }

    // swap entire column stacks (0–2, 3–5, 6–8)
    for (let k = 0; k < 2; k++) {
        let s1 = randInt(0, 2);
        let s2 = randInt(0, 2);
        if (s1 !== s2) {
            let cStart1 = s1 * 3;
            let cStart2 = s2 * 3;
            for (let i = 0; i < 3; i++) {
                swapCols(grid, cStart1 + i, cStart2 + i);
            }
        }
    }

    // transpose (flip across main diagonal)
    if (Math.random() < 0.5) {
        let transposed = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            transposed[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                transposed[r][c] = grid[c][r];
            }
        }
        grid = transposed;
    }

    return grid;
}

function cloneGrid(grid) {
    var copy = [];
    for (var r = 0; r < GRID_SIZE; r++) {
        copy[r] = [];
        for (var c = 0; c < GRID_SIZE; c++) {
            copy[r][c] = grid[r][c];
        }
    }
    return copy;
}

function swapRows(grid, r1, r2) {
    var tmp = grid[r1];
    grid[r1] = grid[r2];
    grid[r2] = tmp;
}

function swapCols(grid, c1, c2) {
    for (var r = 0; r < GRID_SIZE; r++) {
        var tmp = grid[r][c1];
        grid[r][c1] = grid[r][c2];
        grid[r][c2] = tmp;
    }
}

/******************************************************************************
 * Get puzzle for difficulty
 * 
 * Simple generator: removes values from a complete base solution.
 *****************************************************************************/
function getPuzzleForDifficulty(diff) {

    // use current randomized solution if available, otherwise baseSolution
    var source = currentSolution || baseSolution;

    // copy into a new 2D array
    var puzzle = [];
    for (var r = 0; r < GRID_SIZE; r++) {
        puzzle[r] = [];
        for (var c = 0; c < GRID_SIZE; c++) {
            puzzle[r][c] = source[r][c];
        }
    }

    // number of cells to remove
    var removeCount;

    if (diff === "easy") {
        removeCount = 30;
    } else if (diff === "medium") {
        removeCount = 40;
    } else { // hard
        removeCount = 55;
    }

    var removed = 0;
    while (removed < removeCount) {
        var row = floor(random(0, GRID_SIZE));
        var col = floor(random(0, GRID_SIZE));

        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }

    return puzzle;
}


/******************************************************************************
 * Draw loop
 *****************************************************************************/
function draw() {

    background(base);

    drawCells();
    drawGridLines();
}


/******************************************************************************
 * Draw the grid lines (3x3 box boundaries)
 *****************************************************************************/
function drawGridLines() {

    stroke(gridLine);
    strokeWeight(1);

    // bold 3x3 box lines 
    for (var j = 0; j <= GRID_SIZE; j += 3) {
        if (j > 0 && j < GRID_SIZE) {
            // vertical lines
            line(j * cellSize, 0, j * cellSize, height);
            // horizontal lines
            line(0, j * cellSize, width, j * cellSize);
        }
    }
}


/******************************************************************************
 * Draw the cells and numbers
 *****************************************************************************/
function drawCells() {

    if (sudokuGrid == null) {
        return;
    }

    stroke(255);
    textSize(cellSize * 0.5);

    // gap around each 3x3 box
    let boxGap = cellSize * 0.06; 

    for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {

            var cell = sudokuGrid.getCell(r, c);

            // logical cell position
            var x = c * cellSize;
            var y = r * cellSize;

            // spacing at the edges of each 3x3 block
            let leftGap   = (c % 3 === 0) ? boxGap : 0;
            let rightGap  = (c % 3 === 2) ? boxGap : 0;
            let topGap    = (r % 3 === 0) ? boxGap : 0;
            let bottomGap = (r % 3 === 2) ? boxGap : 0;

            let drawX = x + leftGap;
            let drawY = y + topGap;
            let drawW = cellSize - leftGap - rightGap;
            let drawH = cellSize - topGap - bottomGap;
            
            // Choose base background color
            let baseColor;
            if (cell === selectedCell) {
                baseColor = cellHover;
            } else if (cell.invalid) {
                baseColor = cellError;
            } else {
                baseColor = cellBase;
            }

            // Apply random pulse towards white when active
            if (isPulsing) {
                // initialize pulse parameters if missing
                if (!cell.pulseSpeed) {
                    cell.pulseDelay = millis() + random(0, 1000);
                    cell.pulseSpeed = random(0.003, 0.012);
                }

                let now = millis();

                // draw base color only before delay
                if (now < cell.pulseDelay) {
                    fill(baseColor);
                } else {
                    // time since this cell started pulsing
                    let t = (now - cell.pulseDelay) * cell.pulseSpeed;

                    // calc pulse via sin
                    let wave = (sin(t) + 1) * 0.5;
                    let maxBlend = 0.7; 
                    let blendAmount = wave * maxBlend;

                    // blend between baseColor and white
                    let whiteColor = color(255, 255, 255);
                    let pulsedColor = lerpColor(baseColor, whiteColor, blendAmount);

                    fill(pulsedColor);
                }

            } else {
                // normal base color
                fill(baseColor);
            }

            // cell background
            rect(drawX, drawY, drawW, drawH, 6);

            // draw numbers (centered in the logical cell)
            if (cell.value !== 0) {
                fill(cell.given ? textGiven : textUser);
                text(cell.value, x + cellSize / 2, y + cellSize / 2);
            }
        }
    }
}


/******************************************************************************
 * Mouse clicked: 
 * 
 * click to select cell and open overlay
 *****************************************************************************/
function mouseClicked() {
    if (mouseButton === LEFT) {
        handleGridTap(mouseX, mouseY);
    }
}

function touchStarted() {

    // If the overlay is open, don't handle the touch in p5.
    // Let the DOM buttons (numbers, clear, cancel) receive the event.
    if (isOverlayOpen()) {
        return; // don't return false here
    }

    // Only respond if the touch is inside the canvas bounds
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }

    // Otherwise, treat it like a tap on the grid
    handleGridTap(mouseX, mouseY);

}

function handleGridTap(x, y) {

    // ignore when overlay is open
    if (isOverlayOpen()) {
        return;
    }

    // only respond to taps inside the canvas area
    if (x < 0 || x > width || y < 0 || y > height) {
        return;
    }

    selectCellAt(x, y);

    if (selectedCell && !selectedCell.given) {
        openInputOverlay();
    }
}

/******************************************************************************
 * Mouse move: 
 * 
 * change cursor when hovering editable cells (desktop only)
 *****************************************************************************/
function mouseMoved() {

    // only change cursor for desktop devices
    if (window.matchMedia("(pointer: fine)").matches === false) {
        return;  // mobile: no hover cursor
    }

    // if cursor is outside canvas, reset
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        cursor('default');
        return;
    }

    var col = floor(mouseX / cellSize);
    var row = floor(mouseY / cellSize);

    if (!sudokuGrid) {
        cursor('default');
        return;
    }

    var cell = sudokuGrid.getCell(row, col);

    if (cell && !cell.given) {
        // editable cell
        cursor('pointer');  
    } else {
         // given cell
        cursor('default'); 
    }
}


/******************************************************************************
 * GAME INTERACTION HELPERS
 *****************************************************************************/

/******************************************************************************
 * Select cell at given x, y position
 *****************************************************************************/
function selectCellAt(px, py) {

    if (sudokuGrid == null) {
        return;
    }

    // ensure click is inside grid bounds
    if (px < 0 || px > width || py < 0 || py > height) {
        return;
    }

    var col = floor(px / cellSize);
    var row = floor(py / cellSize);

    var cell = sudokuGrid.getCell(row, col);

    // if it's a given cell, no select or highlight
    if (cell.given) {
        if (selectedCell) {
            selectedCell.selected = false;
            selectedCell = null;
        }
        return;
    }

    // deselect previous cell
    if (selectedCell != null) {
        selectedCell.selected = false;
    }

    selectedCell = cell;
    selectedCell.selected = true;
}


/******************************************************************************
 * Set value on currently selected cell (called from number bar / overlay)
 * 
 * Mistake is counted when this move causes the selected cell to become
 * invalid according to Sudoku rules (row/col/box).
 *****************************************************************************/
function setSelectedCellValue(value) {

    if (sudokuGrid == null) {
        return;
    }

    if (selectedCell == null) {
        return;
    }

    // only editable cells can cause mistakes
    if (!selectedCell.given) {

        // remember previous invalid state before the move
        var wasInvalid = selectedCell.isInvalid();

        // apply the value: triggers updateValidation() inside SudokuGrid.setValue
        sudokuGrid.setValue(selectedCell.row, selectedCell.col, value);

        // after validation, check if this move made the cell invalid
        var isNowInvalid = selectedCell.isInvalid();

        // increment mistakes whenever the cell is invalid after the move
        if (isNowInvalid) {
            mistakeCount++;
            updateMistakeDisplay();
        }

        // if  puzzle complete and valid, start pulsing
        if (!isNowInvalid && sudokuGrid.isComplete() && !isPulsing) {
            startPulseAnimation();
        }
    } else {
        // given cells: ensure they aren't modified 
        sudokuGrid.setValue(selectedCell.row, selectedCell.col, selectedCell.getValue());
    }
}


/******************************************************************************
 * Clear value on currently selected cell
 *****************************************************************************/
function clearSelectedCell() {
    if (sudokuGrid == null) {
        return;
    }

    if (selectedCell == null) {
        return;
    }

    sudokuGrid.setValue(selectedCell.row, selectedCell.col, 0);
}


/******************************************************************************
 * OVERLAY HELPERS
 *****************************************************************************/
function openInputOverlay() {
    if (!inputOverlay) return;
    inputOverlay.classList.remove('hidden');
}

function closeInputOverlay() {
    if (!inputOverlay) return;
    inputOverlay.classList.add('hidden');
}

function isOverlayOpen() {
    return inputOverlay && !inputOverlay.classList.contains('hidden');
}

/******************************************************************************
 * Start random pulsing animation for all cells
 * 
 * - target color is white
 * - each cell gets a random delay and random speed
 *****************************************************************************/
function startPulseAnimation() {

    if (!sudokuGrid) return;

    isPulsing = true;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let cell = sudokuGrid.getCell(r, c);

            // start pulsing delay between 0–1000 ms
            cell.pulseDelay = millis() + random(0, 1000);

            // set randome speed
            cell.pulseSpeed = random(0.003, 0.012);
        }
    }
}



/******************************************************************************
 * SUDOKU CELL CLASS
 *****************************************************************************/
class SudokuCell {

    /**
     * @param {int}  _row   row index
     * @param {int}  _col   column index
     * @param {int}  _val   initial value (0 for empty)
     * @param {bool} _given true if the value is part of the starting puzzle
     */
    constructor(_row, _col, _val, _given) {

        // indices
        this.row = _row;
        this.col = _col;

        // value and meta
        this.value = _val || 0;
        this.given = _given || false;

        // UI helpers
        this.selected = false;
        this.invalid = false;

        // pulse animation properties
        this.pulseDelay = 0;   // when this cell starts pulsing (millis-based)
        this.pulseSpeed = 0;   // how fast this cell pulses
    }

    // setters
    setValue(v)   { this.value   = v; }
    setGiven(g)   { this.given   = g; }
    setSelected(s){ this.selected = s; }
    setInvalid(i) { this.invalid = i; }

    // getters
    getValue()    { return this.value; }
    isGiven()     { return this.given; }
    isSelected()  { return this.selected; }
    isInvalid()   { return this.invalid; }
}


/******************************************************************************
 * SUDOKU GRID CLASS
 *****************************************************************************/
class SudokuGrid {

    /**
     * @param {Array} puzzle  9 x 9 array with 0 for empty cells and 1–9 for givens
     */
    constructor(puzzle) {

        this.size = GRID_SIZE;
        this.cells = [];

        for (var r = 0; r < this.size; r++) {
            this.cells[r] = [];
            for (var c = 0; c < this.size; c++) {
                var val = puzzle[r][c];
                var given = (val !== 0);
                this.cells[r][c] = new SudokuCell(r, c, val, given);
            }
        }

        // run initial validation
        this.updateValidation();
    }

    getCell(row, col) {

    // boundary protection
    if (
        row < 0 || row >= this.size ||
        col < 0 || col >= this.size
    ) {
        return null; 
    }

    return this.cells[row][col];
}

    /**
     * Attempt to set value in a cell
     * 
     * does nothing if cell is a given
     * updates validation after setting
     */
    setValue(row, col, value) {

        var cell = this.getCell(row, col);

        if (cell.given) {
            return;
        }

        cell.setValue(value);

        this.updateValidation();
    }

    /**
     * Check rows, columns, and 3x3 boxes for duplicate values
     * and mark cells with conflicts as invalid.
     */
    updateValidation() {

        // reset all invalid flags
        for (var r = 0; r < this.size; r++) {
            for (var c = 0; c < this.size; c++) {
                this.cells[r][c].setInvalid(false);
            }
        }

        // helper to flag duplicates found in a map
        function flagConflicts(map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    var arr = map[key];
                    if (arr.length > 1) {
                        for (var i = 0; i < arr.length; i++) {
                            arr[i].setInvalid(true);
                        }
                    }
                }
            }
        }

        var r, c, v, key;

        // rows
        for (r = 0; r < this.size; r++) {
            var rowMap = {};
            for (c = 0; c < this.size; c++) {
                v = this.cells[r][c].getValue();
                if (v !== 0) {
                    key = String(v);
                    if (!rowMap[key]) rowMap[key] = [];
                    rowMap[key].push(this.cells[r][c]);
                }
            }
            flagConflicts(rowMap);
        }

        // columns
        for (c = 0; c < this.size; c++) {
            var colMap = {};
            for (r = 0; r < this.size; r++) {
                v = this.cells[r][c].getValue();
                if (v !== 0) {
                    key = String(v);
                    if (!colMap[key]) colMap[key] = [];
                    colMap[key].push(this.cells[r][c]);
                }
            }
            flagConflicts(colMap);
        }

        // 3x3 boxes
        for (var br = 0; br < this.size; br += 3) {
            for (var bc = 0; bc < this.size; bc += 3) {

                var boxMap = {};

                for (r = 0; r < 3; r++) {
                    for (c = 0; c < 3; c++) {
                        var cell = this.cells[br + r][bc + c];
                        v = cell.getValue();
                        if (v !== 0) {
                            key = String(v);
                            if (!boxMap[key]) boxMap[key] = [];
                            boxMap[key].push(cell);
                        }
                    }
                }

                flagConflicts(boxMap);
            }
        }
    }

    /**
     * Check if the puzzle is complete and has no invalid cells
     */
    isComplete() {

        for (var r = 0; r < this.size; r++) {
            for (var c = 0; c < this.size; c++) {
                var cell = this.cells[r][c];
                if (cell.getValue() === 0 || cell.isInvalid()) {
                    return false;
                }
            }
        }
        return true;
    }
}


/******************************************************************************
 * DIFFICULTY / MISTAKES HELPERS
 *****************************************************************************/

/**
 * Update the difficulty button symbol based on currentDifficulty
 * easy   = |
 * medium = ||
 * hard   = |||
 */
function updateDifficultySymbol() {

    if (!button1Symbol) return;

    if (currentDifficulty === "easy") {
        button1Symbol.textContent = "|";
    } else if (currentDifficulty === "medium") {
        button1Symbol.textContent = "||";
    } else {
        button1Symbol.textContent = "|||";
    }
}


/**
 * Cycle difficulty: easy to medium to hard to easy...
 * and start a new game at that difficulty
 */
function cycleDifficulty() {

    if (currentDifficulty === "easy") {
        currentDifficulty = "medium";
    } else if (currentDifficulty === "medium") {
        currentDifficulty = "hard";
    } else {
        currentDifficulty = "easy";
    }

    newGame(currentDifficulty);
}


/**
 * Mistake counter helpers
 */
function resetMistakes() {
    mistakeCount = 0;
    updateMistakeDisplay();
}

function updateMistakeDisplay() {
    if (!mistakesDisplay) return;
    mistakesDisplay.textContent = mistakeCount;
}


/******************************************************************************
 * BUTTON AND OVERLAY EVENTS
 *****************************************************************************/

// difficulty button click
if (button1) {
    button1.addEventListener('click', function () {
        cycleDifficulty();
    });
}

// reset game when button clicked
if (resetGameButton) {
    resetGameButton.addEventListener('click', function () {
        newGame(currentDifficulty);
    });
}

// overlay number buttons: set value and close overlay
if (overlayNumberButtons) {
    overlayNumberButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // prevent p5 mouseClicked from firing
            var val = parseInt(btn.getAttribute('data-num'), 10);
            if (!isNaN(val)) {
                setSelectedCellValue(val);
                closeInputOverlay();
            }
        });
    });
}

// overlay clear: clear cell and close overlay
if (overlayClearButton) {
    overlayClearButton.addEventListener('click', function (e) {
        e.stopPropagation();
        clearSelectedCell();
        closeInputOverlay();
    });
}

// overlay cancel: just close
if (overlayCancelButton) {
    overlayCancelButton.addEventListener('click', function (e) {
        e.stopPropagation(); // prevent p5 mouseClicked from firing
        closeInputOverlay();
    });
}

/******************************************************************************
 * Debug helper: print the solution grid (baseSolution) to the console
 ******************************************************************************/
// function printSolutionToConsole() {
//     let src = currentSolution || baseSolution;
//     console.log("SOLUTION GRID:");
//     for (let r = 0; r < GRID_SIZE; r++) {
//         let rowString = "";
//         for (let c = 0; c < GRID_SIZE; c++) {
//             rowString += src[r][c] + " ";
//         }
//         console.log(rowString);
//     }
// }



