//=============================================================================
// scripts page for for find me game
//=============================================================================
const menuButton = document.getElementById('menu-button');
const topButton = document.getElementById('top-button');
const toggleSoundButton = document.getElementById('button-p5-1');
const moreInfoButton = document.getElementById('button-p5-3');
const symbolElement1 = document.getElementById('p5-button-1-symbol');
const symbolElement3 = document.getElementById('p5-button-3-symbol');


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
 * Project:  just a fun way to challenge yourself to be kind
 * 
 * Author:   Yahir
 * 
 * Date:     february 2019
 * 
 * Notes:
 * - LEFT CLICK on cell to reveal
 * - SHIFT + LEFT CLICK to place a flag
 * - PRESS reset button to reset grid
 * 
 * Music by: Bensound.com/royalty-free-music
 * License code: 9U1HL397HJTTOLUY
 ******************************************************************************/
var fontMontserrat;
var parentWidth;
var songTheme;

var showInfo;  // Introduction text
var dSpin;       // Difference in spin and targetValue
var easing;      // easing rate
var finalValue;  // Tracks selected section by the dial
var followDial;  // Value that follows the dial value
var incrementAngle; // Determine the increment angle for created ellipse markers
var spin;        // Tracks spin of the dial
var targetValue; // Large spin value
var bckgrndColor;  // Determines backgroudn color based on dial selection
var beginInfoTrans; // Toggle in and out of info screen
var opacityTrans;     // Track opacity of transition screen
var opacityTransText; // Track opacity of info screen text
var firstClick;

let color1;
let color2;
let color3;
let color4;
let color5;
let color6;
let color7;
let color8;


/******************************************************************************
 * 
 * Preload assessts prior to running setup function
 * 
 *****************************************************************************/
function preload() {
    fontMontserrat = loadFont('../assets/Montserrat-Light.ttf');
    songTheme = loadSound('../assets/beKind/onceagain.mp3');
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
    textFont(fontMontserrat);

    // global stuff
    showInfo = true;
    dSpin = 0;
    easing = 0.015;
    finalValue = 0;
    followDial = 0;
    incrementAngle = 0;
    spin = 22.5;
    targetValue = 22.5;
    bckgrndColor = 0;
    beginInfoTrans = false;
    opacityTrans = 0;
    opacityTransText = 0;
    firstClick = true;

    // color1 = color(155, 184, 237);
    color1 = color(182, 205, 236);
    color2 = color(222, 179, 224);
    color3 = color(255, 221, 228);
    color4 = color(220, 243, 252);
    // color4 = color(163, 159, 225);
    color5 = color(208, 212, 247);
    color6 = color(254, 198, 223);
    color7 = color(254, 236, 214);
    color8 = color(228, 246, 223);
    
}

/******************************************************************************
 * 
 * draw canvas
 * 
 *****************************************************************************/
function draw() {
    // background(242, 232, 220);
    background(163, 159, 225);

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

    var distDial = dist(mouseX, mouseY, 400, 400);
    if(distDial < 50) {
      cursor(HAND);
    } else {
      cursor(ARROW);
    }

    // Spinner pie colors
    noStroke();
    // fill(255, 179, 186); //red // 1 a
    fill(color1);
    triangle(400, 400, 400, 0, 800, 0);
    // fill(255, 255, 186); // yellow // 2 a
    fill(color2);
    triangle(400, 400, 800, 0, 800, 400);
    // fill(179, 255, 245); // blue; //3  a
    fill(color3);
    triangle(400, 400, 800, 400, 800, 800);
    // fill(255, 211, 179); // orange // a
    fill(color4);
    triangle(400, 400, 400, 800, 800, 800);
    // fill(192, 255, 179); // green; // 5 a
    fill(color5);
    triangle(400, 400, 400, 800, 0, 800);
    // fill(164, 197, 193); // pink // 6 a
    fill(color6);
    triangle(400, 400, 0, 800, 0, 400);
    // fill(217, 217, 127); // yellow; // 7
    fill(color7);
    triangle(400, 400, 0, 400, 0, 0);
    // fill(217, 238, 174); // blue // 8 a
    fill(color8);
    triangle(400, 400, 0, 0, 400, 0);

    // Narrows spinner size
  noFill();
  strokeWeight(400);
  switch(bckgrndColor) {
  case 1: 
    stroke(255, 179, 186);
    stroke(color1);
    break;
  case 2: 
    stroke(255, 255, 186);
    stroke(color2);
    break;
  case 3: 
    stroke(179, 255, 245);
    stroke(color3);
    break;
  case 4: 
    stroke(255, 211, 179);
    stroke(color4);
    break;
  case 5: 
    stroke(192, 255, 179);
    stroke(color5);
    break;
  case 6: 
    stroke(164, 197, 193);
    stroke(color6);
    break;
  case 7: 
    stroke(217, 217, 127);
    stroke(color7);
    break;
  case 8: 
    stroke(217, 238, 174);
    stroke(color8);
    break;
  default:
    stroke(194, 176, 204);
    stroke(color1);
    break;
  }
  ellipse(400, 400, 1000, 1000);

  // Spinner outter ring
  strokeWeight(5);
  stroke(155, 127, 170); // Dark Purple
  ellipse(400, 400, 600, 600);

  // Spinner drop shadow feature
  fill(0, 25);
  noStroke();
  // ellipse(500, 780, 400, 10);

  // Main dial design
  push();
  translate(width/2, height/2);
  rotate(radians(spin));
  noStroke();
  fill(194, 176, 204); // Purple outter circle
  ellipse(0, 0, 120, 120);
  fill(155, 127, 170); // Dark purple ring
  ellipse(0, 0, 105, 105);
  fill(229, 221, 233); // Light purple Inner circle
  ellipse(0, 0, 100, 100);
  fill(155, 127, 170); // Dark purple pointer
  triangle(0, -60, 10, -50, -10, -50);
  pop();

  // Dial drop shadow features
  fill(0, 25); 
  beginShape();
  vertex(349, 410);
  vertex(375, 467);
  vertex(467, 420);
  vertex(446, 376);
  vertex(349, 410);
  endShape();
	stroke(0)
	strokeWeight(0);
  curve(199, 283, 375, 467, 467, 420, 380, 258);

  // Dial highlight features
  fill(229, 221, 233); // Inner ring
  ellipse(400, 400, 100, 100);
  fill(255); // Highlight dot
  ellipse(380, 375, 10, 10);

  push();
  translate(width/2, height/2);
  rotate(radians(23));
  // Solid ellipse markers
  incrementAngle = 0;
  for (var i = 0; i < 8; i++) {
    strokeWeight(2);
    stroke(155, 127, 170); // Dark purple
    // fill(229, 221, 233); // Light purple
    fill(194, 176, 204);
    ellipse(300 * cos(incrementAngle), 
            300 * sin(incrementAngle), 
            20, 20);        
    incrementAngle += TWO_PI / 8;
  }

  // Highlight Ellipse Markers
  stroke(125, 88, 145);
  // fill(125, 88, 145); // Dark Purple
  fill(194, 176, 204);
  fill(229, 221, 233);
  followDial = (spin - ((int(spin / 360) * 360)));
  if (followDial <=45) {
    ellipse(300 * cos(4.712389), 300 * sin(4.712389), 20, 20);
  } else if ( followDial <=90) {
    ellipse(300 * cos(5.497787), 300 * sin(5.497787), 20, 20);
  } else if ( followDial<=135) {
    ellipse(300 * cos(6.283185), 300 * sin(6.283185), 20, 20);
  } else if ( followDial<=180) {
    ellipse(300 * cos(0.7853982), 300 * sin(0.7853982), 20, 20);
  } else if ( followDial<=225) {
    ellipse(300 * cos(1.5707964), 300 * sin(1.5707964), 20, 20);
  } else if ( followDial<=270) {
    ellipse(300 * cos(2.3561945), 300 * sin(2.3561945), 20, 20);
  } else if ( followDial<=315) {
    ellipse(300 * cos(3.1415927), 300 * sin(3.1415927), 20, 20);
  } else {
    ellipse(300 * cos(3.926991), 300 * sin(3.926991), 20, 20);
  }
  pop();

  // Display text on spinner
  fill(125, 88, 145);
  DisplaySpinnerOptions("Give a hug", -65, 100, 0);
  DisplaySpinnerOptions("Pick up litter", -20, 100, 0);
  DisplaySpinnerOptions("Volunteer your time", 25, 100, 0);
  DisplaySpinnerOptions("Give a gift", 70, 100, 0);
  DisplaySpinnerOptions("Appreciate someone", 290, -100, 1);
  DisplaySpinnerOptions("Give a compliment", 335, -100, 1);
  DisplaySpinnerOptions("Help a stranger", 380, -100, 1);
  DisplaySpinnerOptions("Send a kind email", 425, -100, 1);

  // Title and Intro Text
  if (opacityTransText <= 0) {
    textSize(40);
    textAlign(CENTER);
    fill(20);
    // text("The Kind Challenge", 400, 100);
    textSize(20);
    if (showInfo) {
      text("Click on the center dial to help create a kinder world.", 400, 750);
      textSize(16);
      // text("Press SPACE key for more info.", 400, 770);
    }
  }

  // Display selected text by checking dial location
  if (opacityTransText <= 0) {
    if (!showInfo) {
      dSpin = targetValue - spin;
      spin += dSpin * easing;
      if ((targetValue - spin) < 1) {
        showInfo = false;
        fill(20);
        textAlign(CENTER);
        if (finalValue <= 45) {
          text("Hugging can reduce stress keeping your immune system\nhealthy and reduce your chances of getting sick.", 400, 740);
          bckgrndColor = 1;
        } else if (finalValue <= 90) {
          text("Studies have shown that litter can negatively\nimpact your sense of community and safety.", 400, 740);
          bckgrndColor = 2;
        } else if ( finalValue <= 135) {
          text("Volunteering helps combat depression, increases\nself-confidence, and provides a sense of purpose.", 400, 740);
          bckgrndColor = 3;
        } else if ( finalValue <= 180) {
          text("Similar to eating chocolate, giving makes us feel good as it\nstimulates the same pleasure circuits in the brain.", 400, 740);
          bckgrndColor = 4;
        } else if ( finalValue <= 225) {
          text("Letting someone know they are valued and appreciated builds\ntrust in relationships.", 400, 740);
          bckgrndColor = 5;
        } else if ( finalValue <= 270) {
          text("Giving someone a compliment has the potential to shift their\nthinking in a positive manner for the rest of their day.", 400, 740);
          bckgrndColor = 6;
        } else if ( finalValue <= 315) {
          text("Research shows, those that help others tend to live longer\nas they have reduced levels of stress, anxiety, and depression.", 400, 740);
          bckgrndColor = 7;
        } else {
          text("Recognizing and being kind to others inspires\nbelonging and deeper relationships.", 400, 740);
          bckgrndColor = 8;
        }
      }
    }
  }

  // Transition to info screen
  if (beginInfoTrans) {
    opacityTrans+=4;
    if (opacityTrans > 230) {
      opacityTrans = 230;
      showInfo = true;
      bckgrndColor = 0;
    }
  } else {
    opacityTransText -=10;
    if (opacityTransText < 0) {
      opacityTransText = 0;
    }
    if (opacityTransText == 0) {
      opacityTrans -= 10;
      if (opacityTrans < 0) {
        opacityTrans = 0;
      }
    }
  }
  if (opacityTrans == 230) {
    opacityTransText += 4; 
    if (opacityTransText > 255) {
      opacityTransText = 255;
    }
  } 
  fill(155, 127, 170, opacityTrans); 
  noStroke();
  rect(0, 0, 800, 800); 
  fill(20, opacityTransText);

  textAlign(CENTER);
  textSize(40);
  text("Be Kind.", 400, 250);
  textSize(20);
  text("This challenge was made as a reminder that\n within every moment exists an opportunity  to do\nsomething kind.\n\nTake a spin and be the change the world needs today.", 400, 320);
  textSize(16);
  text("Created by Yahir\nMusic from bensound.com (Once Again).", 400, 520);
}

/******************************************************************************
 * A function to display the text to be displayed within the spinner section
 *
 * @param spinnerText   String value of the text to be displayed
 * @param rotateAmt     Int value of the degrees of text rotation
 * @param xStart        Int value of the start of the text
 * @param align         Int value to align text (0 for LEFT and 1 for RIGHT)
 *****************************************************************************/
function DisplaySpinnerOptions(spinnerText, rotateAmt, xStart, align) {
  push();
	fill(155, 127, 170);
  translate(width/2, height/2);
  textSize(14);
  if (align == 0) {
    textAlign(LEFT);
  } else {
    textAlign(RIGHT);
  }
  rotate(radians(rotateAmt));
  text(spinnerText, xStart, 0);
  pop();
}

/******************************************************************************
 * 
 * When the mouse is clicked check that it is within dial location
 * select random target value to begin spinning dial
 * calculate the final value to determine dial selection
 * 
 *****************************************************************************/
function mouseClicked() {
  if (!beginInfoTrans) {
    // Check mouse is within dial size and then selected targetValue and finalValue
    if (abs(dist(mouseX, mouseY, 400, 400)) < 50) {
      if(firstClick) {
        songTheme.play();
        symbolElement1.innerHTML ="&#8414";
        firstClick = false;
      }
      showInfo = false;
      spin = targetValue;
      targetValue = targetValue + random(720, 1440);
      finalValue = (targetValue - (int(targetValue / 360) * 360));
    }
  }
}
  
//=============================================================================
// p5 button events
//=============================================================================

/******************************************************************************
*
* toggle sound playing
* 
*****************************************************************************/
toggleSoundButton.addEventListener('click', function() {
  if(songTheme.isPlaying()) {
    songTheme.pause();
    symbolElement1.innerHTML ="&#9655";
  } else {
    songTheme.play();
    if(firstClick) firstClick = false;
    symbolElement1.innerHTML = "&#8414";
  }

});


/******************************************************************************
*
* toggle showing more info
* 
*****************************************************************************/
moreInfoButton.addEventListener('click', function() {
  beginInfoTrans = !beginInfoTrans;
  
  if(beginInfoTrans) {
    symbolElement3.innerHTML = "&#10539"
  } else {
    symbolElement3.innerHTML ="&#11096"
  }
});


