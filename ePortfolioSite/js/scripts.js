/**
 * Author: 	Yahir Rendon 
 * Date:	April 2021
 * Update:  July 2021
 * Project: ePortfolio
 * 
 * scripts
 */

/**
 * On windowload check navigaton display and
 * set onClick listeners
 */
window.onload = function () {
	navigationBarToggle();
	goToDesignPage();
	goToAlgorithmsPage();
	goToDatabasePage();

	goToAlgorithmsGitProject();
	goToDesignGitProject();
	goToProject();
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

/**
 * on click send user to the algorithms and data
 * structures page for a detailed explanation of 
 * the project's enhancments and details
 */
function goToAlgorithmsPage() {
	$("#algorithms_button").click(function () {
		window.location.href = "ePortfolioSite/pages/algorithms.html";
	})
}

/**
 * on click send user to the database page for a
 * detailed explanation of the project's 
 * enhancments and details
 */
function goToDatabasePage() {
	$("#database_button").click(function () {
		window.location.href = "ePortfolioSite/pages/database.html";
	})
}

/**
 * on click send user to the software design and engineering
 * page for a detailed explanation of the project's
 * enhancments and details
 */
function goToDesignPage() {
	$("#design_button").click(function () {
		window.location.href = "ePortfolioSite/pages/design.html";
	})
}

/**
 * on click send user to the github page that contains
 * algorithm project files and code
 */
function goToAlgorithmsGitProject() {
	$("#algorithms_github_button").click(function () {
		window.location.href = "https://github.com/yahirRendon/weather_station";
	})
}

/**
 * on click send user to the github page that contains
 * design project files and code
 */
function goToDesignGitProject() {
	$("#design_github_button").click(function () {
		window.location.href = "https://github.com/yahirRendon/weather_station";
	})
}

function goToProject() {
	$(".proj_a").click(function () {
		window.open('https://github.com/yahirRendon/Creative_Coding/tree/main/Processing/Instagram_Filter_Sine_Particles', '_newtab');
	})

	$(".proj_b").click(function () {
		window.open('https://github.com/yahirRendon/Creative_Coding/tree/main/Processing/Visualizer_Rings_Solo_Static_Public', '_newtab');
	})
	$(".proj_c").click(function () {
		window.open('https://github.com/yahirRendon/Creative_Coding/tree/main/Processing/Visualizer_Rings_Solo_Revolve_Public', '_newtab');
	})



}
