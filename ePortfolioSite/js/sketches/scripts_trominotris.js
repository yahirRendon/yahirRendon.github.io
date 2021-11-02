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
    createCanvas(400, 400)
    background(200);
}

function draw() {

}

function keyPressed() {
    song.play();
}
