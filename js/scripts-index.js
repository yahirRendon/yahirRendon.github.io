//=============================================================================
// scripts page for index
//=============================================================================
const arrowElement = document.getElementById('arrow-down');
const arrowToDesign = document.getElementById('arrow-to-design');
const arrowToDevelop = document.getElementById('arrow-to-develop');
const arrowToTips = document.getElementById('arrow-to-tips');
const menuButton = document.getElementById('menu-button');
const topPageButton = document.getElementById('top-button');
const p5Canvas = document.getElementById('p5-canvas');

// observer for animate in category content
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add('category-show');

            if (entry.target.id == 'arrow-to-design') {
                entry.target.classList.remove("active");
            }
            if (entry.target.id == 'arrow-to-develop') {
                entry.target.classList.remove("active");
            }
        } else {
            entry.target.classList.remove('category-show');

            if (entry.target.id == 'arrow-to-design') {
                entry.target.classList.add("active");
            }
            if (entry.target.id == 'arrow-to-develop') {
                entry.target.classList.add("active");
            }
        }
    });
});
const hiddenElementsLeft = document.querySelectorAll('.cat-hide-left');
hiddenElementsLeft.forEach((el) => observer.observe(el));
const hiddenElementsRight = document.querySelectorAll('.cat-hide-right');
hiddenElementsRight.forEach((el) => observer.observe(el));
const hiddenElementsArrows = document.querySelectorAll('.arrow-d-box');
hiddenElementsArrows.forEach((el) => observer.observe(el));

/******************************************************************************
*  
* run when window loads
* 
*****************************************************************************/
window.onload = function () {
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
 * hide down arrow when no longer at top of page
 * 
 *****************************************************************************/
window.addEventListener("scroll", function () {
    // var testElem = document.getElementsByClassName('reveal')[0];
    if (window.scrollY > 100) {
        // arrowElement.style.display = "none";  
        arrowElement.classList.add("active");
    } else {
        // arrowElement.style.display = "grid";
        arrowElement.classList.remove("active");
    }

    // if(window.scrollY > 750) {
    //     arrowToDesign.classList.add("active");
    // } else {
    //     arrowToDesign.classList.remove("active");
    // }

}, false);

/******************************************************************************
 * 
 * move page to dream section
 * 
 *****************************************************************************/
arrowElement.addEventListener('click', arrowDown);
function arrowDown() {
    const element = document.getElementById('category-1');
    element.scrollIntoView({ behavior: "smooth", block: "start" });
}

/******************************************************************************
 * 
 * move page to design section
 * 
 *****************************************************************************/
arrowToDesign.addEventListener('click', goToDesign);
function goToDesign() {
    const element = document.getElementById('category-design');
    element.scrollIntoView({ behavior: "smooth", block: "start" });
}

/******************************************************************************
 * 
 * move page to develop section
 * 
 *****************************************************************************/
arrowToDevelop.addEventListener('click', goToDevelop);
function goToDevelop() {
    const element = document.getElementById('category-develop');
    element.scrollIntoView({ behavior: "smooth", block: "start" });
}

/******************************************************************************
 * 
 * move page to landing tips
 * 
 *****************************************************************************/
arrowToTips.addEventListener('click', goToTips);
function goToTips() {
    const element = document.getElementById('landing-tips');
    element.scrollIntoView({ behavior: "smooth", block: "start" });
}

/******************************************************************************
 * 
 * move to top of page from footer
 * 
 *****************************************************************************/
topPageButton.addEventListener('click', goToTop);
function goToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//=============================================================================
// p5.js sketch
//=============================================================================

/******************************************************************************
 * p5.js sketch
 * 
 * Project:  attract and repel text
 * 
 * Author:   Yahir
 * 
 * 
 * Notes:
 * - LEFT CLICK | toggle repel and attract
 * - MOUS OVER  | repel or attract text pixels
 ******************************************************************************/
var fontMontserrat;                 // custom font
var parentWidth;                    // track canvas parent width
var parentHeight;                   // track canvas parent height
var xAdj;                           // x adjustment to center text
var yAdj;                           // y adjustment to center text
var pxls;                           // array holding pxls making up text
var mouseRadius;                    // radius from mouse influencing pxls
var radiusAdj;                      // offset for randomness margin of radius
var loadCol;                        // track which img pixel column is being loaded
var repelPxls;                      // toggle repel and attracting pxls

// png img with text
var imgPath = "./assets/creative-developer-text.png";
var pxls;
const img = new Image();
img.src = imgPath;
img.onload = function () { };

/******************************************************************************
 * 
 * Preload assessts prior to running setup function
 * 
 *****************************************************************************/
function preload() {
    // img = loadImage("./assets/txt-word-light.png");
    fontMontserrat = loadFont('./assets/Montserrat-Light.ttf');
}

/******************************************************************************
 * 
 * setup up canvas
 * 
 *****************************************************************************/
function setup() {
    parentWidth = document.getElementById('p5-canvas').offsetWidth;
    parentHeight = document.getElementById('p5-canvas').offsetHeight;

    let canvas = createCanvas(parentWidth, parentHeight);
    canvas.parent('p5-canvas');
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    textFont(fontMontserrat);
    textSize(16);

    // loadingPxls = false;
    repelPxls = true;
    loadCol = 0;

    mouseRadius = int(img.width * .30);
    radiusAdj = int(mouseRadius * .25);

    xAdj = (parentWidth - img.width) / 2;
    yAdj = (parentHeight - img.height) / 2;

    background(26, 3, 96);

    pxls = getNonTransparentPixels(img);
}

/******************************************************************************
 * 
 * draw canvas loop
 * 
 *****************************************************************************/
function draw() {
    background(26, 3, 96);

    // display and move pxls
    for (var i = 0; i < pxls.length; i++) {
        let distance = dist(mouseX, mouseY, pxls[i].x + xAdj, pxls[i].y + yAdj);
        let blurLimit = mouseRadius + random(-radiusAdj, radiusAdj);
        if (distance < blurLimit) {
            pxls[i].move(repelPxls);
            pxls[i].setTime();
        }
        else {
            pxls[i].moveHome();
        }
        pxls[i].display();
    }
}

/******************************************************************************
 * resize canvas with window adjustment
 * 
 * issues occur if parent windos is purely dynamic. added min px size to avoid
 * resize canvas issue. 
 *****************************************************************************/
function windowResized() {
    parentWidth = document.getElementById('p5-canvas').offsetWidth;
    parentHeight = document.getElementById('p5-canvas').offsetHeight;
    resizeCanvas(parentWidth, parentHeight);

    // update x and y adjustment to place text in center of canvas
    xAdj = (parentWidth - img.width) / 2;
    yAdj = (parentHeight - img.height) / 2;
}

/******************************************************************************
 * class for creating a pixel that has primary attributes of:
 * - a home postion
 * - a moveable position
 * - ablity to return to home position
 *****************************************************************************/
class Pxl {
    constructor(x, y, r, g, b, a, d) {
        this.d = abs(int(map(d, 0, 1, -5, 16)));   // distance offset for start
        if (this.d < 0) this.d = 0;
        this.orgX = x;                             // origin/home x position
        this.orgY = y;                             // origin/home y position                        
        this.x = x + int(random(-this.d, this.d)); // moveable x position
        this.y = y + int(random(-this.d, this.d)); // moveable y position

        this.hueVal = 99;                       // default hue val
        this.satVal = 0;                        // saturation val from img text
        this.briVal = 0;                        // brightness val from img text
        this.alphaVal = a;                      // alpha val from img text
        this.easing = random(0.1, 0.2);         // easing factor
        this.speed = random(2, 5);              // repel/attract speed
        this.easeDelay = this.easeDelay = int(random(3000, 5000)); // delay before returning home
        this.time = millis();                    // track time
        this.size = 1.5;                         // default pxl size
        this.firstMove = true;                   // track if this is first placment to limit size modulation
    }

    /******************************************************************************
     * 
     * reset time variable 
     * 
     *****************************************************************************/
    setTime() {
        this.time = millis();
    }

    /******************************************************************************
     * 
     * display the pxl
     * 
     *****************************************************************************/
    display() {
        // stroke(this.c);
        // point(this.x + xAdj, this.y + yAdj);
        let maxDistance = 75;
        let distance = dist(this.orgX, this.orgY, this.x, this.y);
        if (!this.firstMove) {
            this.size = map(distance, 0, maxDistance * 2, 1.5, 3);
            this.satVal = map(distance, 0, maxDistance, 0, 80);
            this.briVal = map(distance, 0, maxDistance, 0, 15);
        }

        fill(this.hueVal, this.satVal, this.briVal, this.alphaVal);
        // square(this.x + xAdj, this.y + yAdj, this.size);
        // circle(this.x + xAdj, this.y + yAdj, this.size);
        ellipse(this.x + xAdj, this.y + yAdj, this.size);
    }

    /******************************************************************************
     * 
     * move pxl back to origin/home position
     * 
     *****************************************************************************/
    moveHome() {
        if (millis() < this.time + this.easeDelay) {
            return;
        }

        // ease x value home 
        let dx = this.orgX - this.x;
        if (abs(dx) < 2) {
            this.x = this.orgX;
            this.firstMove = false;
        }
        else {
            this.x += dx * this.easing;
        }

        // ease y value home
        let dy = this.orgY - this.y;
        if (abs(dy) < 2) {
            this.y = this.orgY;

        }
        else {
            this.y += dy * this.easing;
        }
    }

    /******************************************************************************
     * 
     * perform repel or attrack function
     * 
     *****************************************************************************/
    move(repelPxl) {
        if (repelPxl) {
            this.repel();
        }
        else {
            this.attract();

        }
        this.setTime();
    }

    /******************************************************************************
     * 
     * repel pxl away from mouse
     * 
     *****************************************************************************/
    repel() {
        let angle = atan2(mouseY - (this.y + yAdj), mouseX - (this.x + xAdj));
        this.x -= this.speed * cos(angle);
        this.y -= this.speed * sin(angle);
    }

    /******************************************************************************
     * 
     * attract pxl to mouse
     * 
     *****************************************************************************/
    attract() {
        let angle = atan2(mouseY - (this.y + yAdj), mouseX - (this.x + xAdj));
        this.x += this.speed * cos(angle);
        this.y += this.speed * sin(angle);
    }
}

/******************************************************************************
 * 
 * function for getting text pixels from image
 * 
 *****************************************************************************/
function getNonTransparentPixels(img) {
    // Create a canvas element and set its dimensions to match the image
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let zoff = random(203);

    // Get the 2D context of the canvas and draw the image to it
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Loop through the pixels and create a Pxl object for each non-transparent pixel
    const pixels = [];
    let yoff = 0;
    for (let y = 0; y < canvas.height; y++) {
        let xoff = 0;
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];

            if (a > 0) {
                let nd = noise(xoff, yoff, zoff);
                pixels.push(new Pxl(x, y, r, g, b, a, nd));
            }
            xoff += 0.05;
        }
        yoff += 0.05;
        zoff += 0.005;
    }

    return pixels;
}

/******************************************************************************
 * 
 * Toggle between repel or attract pxl feature
 * 
 *****************************************************************************/
p5Canvas.addEventListener('click', myFunction);
function myFunction() {
    repelPxls = !repelPxls;
}

