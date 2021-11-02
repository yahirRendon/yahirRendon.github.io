/**************************************************************
 Project:  Trominotris
 Author:   Yahir
 Date:     November 2021
 
 **************************************************************/

var song;

function preload() {
    song = loadSound('../../assets/bensound-dreams.mp3')

}

function setup() {
    // set up canvas
    var parentWidth = document.getElementById('p5Canvas').offsetWidth;
    var parentHeight = document.getElementById('p5Canvas').offsetHeight;
    var canvas = createCanvas(800, 800);
 
    // Move the canvas so it’s inside div with id="p5Canvas">.
    canvas.parent('p5Canvas');
    
}

function draw() {
    background(108, 86, 123);
}

function keyPressed() {
    song.play();
}
