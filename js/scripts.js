/**
 * Author: 	Yahir Rendon 
 * Date:	April 2021
 * Project: ePortfolio
 * 
 * scripts
 */

var goToDesign = document.getElementById('designButton');
var goToAlgo = document.getElementById('algoButton');
var goToData = document.getElementById('dataButton');

/**
 * On windowload check navigation display
 */
window.onload = function () {
	navigationBarToggle()
}

// check onClick element exists on page
if(goToDesign){
    goToDesign.addEventListener("click", openDesign);
}

if(goToAlgo){
    goToAlgo.addEventListener("click", openAlgo);
}

if(goToData){
    goToData.addEventListener("click", openData);
}

// go to desired page
function openDesign() {
    window.location.href = "design.html";
}

function openAlgo() {
    window.location.href = "algo.html";
}

function openData() {
    window.location.href = "database.html";
}

/**
 * Toggle the navigation bar between show/hide
 */
function navigationBarToggle() {
	// on menuButton click check if navigation menu is hidden
	// or not and do the opposite 
	$("#menuButton").click(function () {
		if ($('.home').css('display') == 'none') {
            $(".home").css({ display: "inline" }).show();
            $(".plan").css({ display: "inline" }).show();
			$(".about").css({ display: "inline" }).show();
		} else {
			$(".home").css({ display: "none" }).hide();
            $(".plan").css({ display: "none" }).hide();
            $(".about").css({ display: "none" }).hide();
		}
	})
}
