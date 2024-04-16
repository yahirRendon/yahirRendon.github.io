/******************************************************************************
*
* javascript for index page
* 
*****************************************************************************/
// get dom elements
const p5Canvas = document.getElementById('p5-canvas');
const arrowToDream = document.getElementById('arrow-to-dream');
const arrowToDesign = document.getElementById('arrow-to-design');
const arrowToDevelop = document.getElementById('arrow-to-develop');

let elementDreamImgA = document.getElementById("dream-img-a");
let elementDreamImgB = document.getElementById("dream-img-b");
let elementDesignImgA = document.getElementById("design-img-a");
let elementDesignImgB = document.getElementById("design-img-b");
let elementDevelopImgA = document.getElementById("develop-img-a");
let elementDevelopImgB = document.getElementById("develop-img-b");

var mousePosY = 0; // store mouse x pixel position
var mousePosX = 0; // store mouse y pixel position

// load array of images for dream section
let dreamPath = "url(./img/laptop/";  // path to image series folder
let dreamImages = ["laptop-01",
    "laptop-02",
    "laptop-03",
    "laptop-04",
    "laptop-05",
    "laptop-06",
    "laptop-08"];


let designPath = "url(./img/drawing/";  // path to image series folder
// load array of image names that will be used for image series on scroll effect
let designImages = ["drawing-01",
    "drawing-02",
    "drawing-03",
    "drawing-04",
    "drawing-05",
    "drawing-06",
    "drawing-07"];
// load array of images for develop section
let developPath = "url(./img/humanity/";  // path to image series folder
let developImages = ["humanity-code-01",
    "humanity-code-02",
    "humanity-code-03",
    "humanity-code-04",
    "humanity-code-05",
    "humanity-code-06",
    "humanity-code-07"];

// create objects for image montage effect
let dreamImg;
let designImg;
let developImg;

/******************************************************************************
*
* run when everything has loaded
* 
*****************************************************************************/
// window.onload = function () {
//     // dom element background, dom element foreground, offset top, offset bottom, image array, image path
//     designImg = new TestClass(elementDesignImgA, elementDesignImgB, 100, 100, designImages, designPath);
//     developImg = new TestClass(elementDevelopImgA, elementDevelopImgB, 400, 0, developImages, developPath);

// }

window.addEventListener("load", function () {
    // this works only because they all have the same number of images
    // would need to rework for image series of different lengths
    for (var i = 0; i < dreamImages.length; i++) {
        preloadImage(dreamImages[i]);
        preloadImage(designImages[i]);
        preloadImage(designImages[i]);
    }
    // offset top, offset bottom
    dreamImg = new ScrollAnim(elementDreamImgA, elementDreamImgB, 0, 430, dreamImages, dreamPath);
    designImg = new ScrollAnim(elementDesignImgA, elementDesignImgB, 100, 130, designImages, designPath);
    developImg = new ScrollAnim(elementDevelopImgA, elementDevelopImgB, 100, 0, developImages, developPath);
});

/******************************************************************************
*
* run when scrolling is occuring
* 
*****************************************************************************/
window.onscroll = function () {
    // update image montage effect
    dreamImg.update();
    designImg.update();
    developImg.update();

    if (window.scrollY > arrowToDream.offsetTop - 100) {
        arrowToDream.classList.add("active");
    } else {
        arrowToDream.classList.remove("active");
    }
    if (window.scrollY > arrowToDesign.offsetTop - 100) {
        arrowToDesign.classList.add("active");
    } else {
        arrowToDesign.classList.remove("active");
    }
    if (window.scrollY > arrowToDevelop.offsetTop - 100) {
        arrowToDevelop.classList.add("active");
    } else {
        arrowToDevelop.classList.remove("active");
    }
}

/******************************************************************************
 * 
 * move page to dream section
 * 
 *****************************************************************************/
arrowToDream.addEventListener('click', goToDread);
function goToDread() {
    const element = document.getElementById('category-dream');
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
* move to top of page from footer
* 
*****************************************************************************/
buttonTop.addEventListener('click', goToTop);
function goToTop() {
    // requires smooth scrool in html tag in css
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    //  option wihtout using smooth scroll in css html
    // window.scrollTo({
    //     top: 0,
    //     behavior: 'smooth'
    // });
}


/******************************************************************************
*
* function for preloading images on page load. Not sure if this helps with
* flickering as the preload in html seems to work better. 
* 
*****************************************************************************/
function preloadImage(im_url) {
    let img = new Image();
    img.style.src = im_url;
}

/******************************************************************************
*
* function for mapping values from one range to another
* 
*****************************************************************************/
function linearMap(number, inMin, inMax, outMin, outMax) {
    if (number <= inMin) return outMin;
    if (number >= inMax) return outMax;
    return Math.floor((number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
}

/******************************************************************************
*
* calss for creating objects that help scroll animation for images
* 
*****************************************************************************/
class ScrollAnim {
    constructor(elementA, elementB, offsetTopAmt, offsetBotAmt, images, imgPath) {
        this.elementA = elementA;
        this.elementB = elementB;
        this.offsetTopAmt = offsetTopAmt;
        this.offsetBotAmt = offsetBotAmt;
        this.images = images;
        this.imgPath = imgPath;
        this.lastIndexPos = 0;
        this.indexPos = 0;
    }

    /**
     * update elements for the stop animation effect
     */
    update() {
        // get the total pixel height of the page
        var totalPixelHeight = document.documentElement.scrollHeight;
        // get the max value that scrollY will return to view whole page
        var maxScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        // remap scrollY to to total pixel range for finer scroll control
        var mapScrollY = linearMap(scrollY, 0, maxScrollY, 0, totalPixelHeight)

        // get the start pixel position that will begin triggering image change
        var startPos = this.elementB.offsetTop + this.offsetTopAmt;
        // get the end position that will end triggering image changes
        var endPos = this.elementB.offsetTop + (this.elementB.offsetHeight - this.offsetBotAmt);
        // map the trigger range to index value in image series
        this.indexPos = linearMap(mapScrollY, startPos, endPos, 0, this.images.length - 1);

        // check for index changes to update elementA (background) and
        // elementB (foreground)
        if (this.lastIndexPos != this.indexPos) {
            // create index point to prior position to get previous or next iamge in series
            // depending on direction of scroll
            var indexPrior = this.indexPos;
            if (this.indexPos > this.lastIndexPos) {
                indexPrior--;
            } else {
                indexPrior++;
            }
            // limit check
            if (indexPrior < 0) indexPrior + this.images.length - 1;
            if (indexPrior > this.images.length - 1) indexPrior = 0;
            // update elementA image (background)
            this.elementA.style.content = this.imgPath + this.images[indexPrior] + ".jpg)";

            // triggger animation for elementB (foreground)
            this.elementB.classList.remove("fadeIn-mod");
            void this.elementB.offsetWidth; // trigger reflow
            this.elementB.classList.add("fadeIn-mod");

            this.elementB.style.content = this.imgPath + this.images[this.indexPos] + ".jpg)";

            // update index value
            this.lastIndexPos = this.indexPos;
        }
    }
}

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
var fontPoppins;                    // custom font
var parentWidth;                    // track canvas parent width
var parentHeight;                   // track canvas parent height
var xAdj;                           // x adjustment to center text
var yAdj;                           // y adjustment to center text
var pxls;                           // array holding pxls making up text
var mouseRadius;                    // radius from mouse influencing pxls
var radiusAdj;                      // offset for randomness margin of radius
var loadCol;                        // track which img pixel column is being loaded
var repelPxls;                      // toggle repel and attracting pxls
var currentTime;                    // current millis time used for tracking if mouse moves
var timeDelayAmt;                   // time delay when mouse is not moving (ms)

// png img with text
var imgPath = "./assets/creative-developer-text-poppins-lt.png"; // ./ when properly structured
var pxls;
let img = new Image();
img.src = imgPath;
img.onload = function () { };


/******************************************************************************
 * 
 * Preload assessts prior to running setup function
 * 
 *****************************************************************************/
function preload() {
    // img = loadImage("./assets/txt-word-light.png");
    fontPoppins = loadFont('./assets/Poppins-Light.ttf'); // ./ when properlly structured
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
    textFont(fontPoppins);
    textSize(16);
    background(180, 1, 92);

    repelPxls = true;
    var r = int(random(0, 10));
    if (r % 2 == 0) repelPxls = false;

    loadCol = 0;

    mouseRadius = int(img.width * .30);
    radiusAdj = int(mouseRadius * .25);

    // x and y adjument to center image text
    xAdj = (parentWidth - img.width) / 2;
    yAdj = (parentHeight - img.height) / 2;

    pxls = getNonTransparentPixels(img);

    timeDelayAmt = 1000;
    currentTime = millis();
}

/******************************************************************************
 * 
 * draw canvas loop
 * 
 *****************************************************************************/
function draw() {
    background(180, 1, 92);

    // track if mouse position is the same for more than timeDelayAmt allows
    // if so mouse is no longer active and should not repel/push pixels
    var mouseActive = true;
    if (pmouseX == mouseX && pmouseY == mouseY) {
        if (millis() > currentTime + timeDelayAmt) {
            mouseActive = false;
        }
    } else {
        currentTime = millis();
    }

    // display and move pxls
    for (var i = 0; i < pxls.length; i++) {
        let distance = dist(mouseX, mouseY, pxls[i].x + xAdj, pxls[i].y + yAdj);
        let blurLimit = mouseRadius + random(-radiusAdj, radiusAdj);
        if (distance < blurLimit && mouseActive) {
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

        this.hueVal = 356;                       // default hue val
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
        // if (!this.firstMove) {
        this.size = map(distance, 0, maxDistance * 2, 1.5, 3);
        this.satVal = map(distance, 0, maxDistance, 0, 58);
        this.briVal = map(distance, 0, maxDistance, 0, 93);
        // }

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
        if (millis() < this.time + this.easeDelay) return;

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
        let randAmt = random(-5, 5);
        let angle = atan2((mouseY + randAmt) - (this.y + yAdj), (mouseX + randAmt) - (this.x + xAdj));
        this.x -= this.speed * cos(angle);
        this.y -= this.speed * sin(angle);
    }

    /******************************************************************************
     * 
     * attract pxl to mouse
     * 
     *****************************************************************************/
    attract() {
        let randAmt = random(-5, 5);
        let angle = atan2((mouseY + randAmt) - (this.y + yAdj), (mouseX + randAmt) - (this.x + xAdj));
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

    // Get the 2D context of the canvas and draw the image to it
    const ctx = canvas.getContext("2d");
    // #fix: for small screens set size here. needs to recenter
    ctx.drawImage(img, 0, 0);

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let zoff = random(203);
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