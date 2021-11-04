/**
 * Author: 	Yahir Rendon 
 * Date:	April 2021
 * Update:  August 2021
 * Project: ePortfolio
 * 
 * scripts
 */



var numProjects = 6;
var projectIndex = numProjects;
var projectData = 
{
	"projects": [
	  {
		"id": 0,
		"style": 1,
		"title": "Particulate Matter -Photo",
		"description": "Inspired by an Instagram filter",
		"imgName": "../img/project_img/instagramFilterSineParticleDemo.gif",
		"link": "https://github.com/yahirRendon/Creative_Coding/tree/main/Processing/Instagram_Filter_Sine_Particles"
	  },
	  {
		"id": 1,
		"style": 1,
		"title": "Ring Visualizer -Static",
		"description": "Audio vizualizer in ring form",
		"imgName": "../img/project_img/Viz_Ring_Fixed_Gif.gif",
		"link": "https://github.com/yahirRendon/Creative_Coding/tree/main/Processing/Visualizer_Rings_Solo_Static_Public"
	  },
	  {
		"id": 2,
		"style": 0,
		"title": "Ring Visualizer -Revolve",
		"description": "Audio visualizer with revolving ring peaks",
		"imgName": "../img/project_img/Viz_Ring_Revolve_Gif.gif",
		"link": "https://github.com/yahirRendon/Creative_Coding/tree/main/Processing/Visualizer_Rings_Solo_Revolve_Public"
	  },
	  {
		"id": 3,
		"style": 0,
		"title": "Game of Life -Image",
		"description": "Classic game with a revealing twist",
		"imgName": "../img/project_img/Game_of_Life_Image_prjgif.gif",
		"link": "https://yahirrendon.github.io/ePortfolioSite/pages/sketches/gameoflife.html"
	  },
	  {
		"id": 4,
		"style": 0,
		"title": "Game of Life -Shift",
		"description": "Classic game with a shifted twist",
		"imgName": "../img/project_img/Game_of_Life_shifted_prjgif.gif",
		"link": "https://yahirrendon.github.io/ePortfolioSite/pages/sketches/gameoflife.html"
	  },
	  {
		"id": 5,
		"style": 0,
		"title": "Sweeper",
		"description": "Classic game in a minimal layout",
		"imgName": "../img/project_img/sweep_g.gif",
		"link": "https://yahirrendon.github.io/ePortfolioSite/pages/sketches/sweeper.html"
	  },
	  {
		"id": 6,
		"style": 0,
		"title": "Trominotris",
		"description": "A minimal Tetris game with trominoes",
		"imgName": "../img/project_img/trominogris_gif.gif",
	 	"link": "https://yahirrendon.github.io/ePortfolioSite/pages/sketches/trominotris.html"
	  }
	]
  };

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

	populateProjects();
	projectNavigationButtons();
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


/**
 * Populate the project page display grid
 */
function populateProjects() {
	let index = projectIndex;

	for(let i = 0; i < 3; i++, index--) {
		
		let projStyle = projectData.projects[index].style;
		let styleColor = "black";
		if(projStyle == 1) {
			styleColor = "white";
		} 
		// update background image and text
		$('.proj_img_' + parseInt(i)).css('background-image', 'url(' + projectData.projects[index].imgName + ')');
		$('.proj_title_' + parseInt(i)).text(projectData.projects[index].title);
		$('.proj_sub_' + parseInt(i)).text(projectData.projects[index].description);
		
		// update styling
		$('.proj_' + parseInt(i)).hover(function(){
			$('.proj_title_' + parseInt(i)).css("color", styleColor);
			$('.proj_sub_' + parseInt(i)).css("color", styleColor);
			$('.proj_title_' + parseInt(i)).css("transition", "color 300ms");
			$('.proj_sub_' + parseInt(i)).css("transition", "color 300ms");
		}, function() {
			$('.proj_title_' + parseInt(i)).css("color", "transparent");
			$('.proj_sub_' + parseInt(i)).css("color", "transparent");
			$('.proj_title_' + parseInt(i)).css("transition", "color 300ms");
			$('.proj_sub_' + parseInt(i)).css("transition", "color 300ms");		
		});	

		
	}
}

/**
 * Cycle through projects and 
 * on click go to specific project page
 */
function projectNavigationButtons() {
	$("#project_next_button").click(function() {
		projectIndex -= 3;
		if(projectIndex  < 3) {
			projectIndex = 2;
		}
		populateProjects();	
	});

	$("#project_prev_button").click(function() {
		projectIndex += 3;
		if(projectIndex > numProjects - 1) {
			projectIndex = numProjects;
		}
		populateProjects();		
	});

	$('.proj_0').click(function () {
		window.location.href = projectData.projects[projectIndex].link;
		console.log("proj_0", projectIndex);
	})
	$('.proj_1').click(function () {
		window.location.href = projectData.projects[projectIndex - 1].link;
		console.log("proj_1", projectIndex -1);
	})
	$('.proj_2').click(function () {
		window.location.href = projectData.projects[projectIndex - 2].link;
		console.log("proj_2", projectIndex - 2);
	})
}
