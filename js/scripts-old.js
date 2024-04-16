//=============================================================================
// scripts for pages that don't have a canvas
//=============================================================================
const instagramLogo = document.getElementById('instagram-logo');
const squareSpaceLogo = document.getElementById('squarespace-logo');
const linkedinLogo = document.getElementById('linkedin-logo');
const menuButton = document.getElementById('menu-button');
const topButton = document.getElementById('top-button');

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
* open new tab to instagram
* 
*****************************************************************************/
instagramLogo.addEventListener('click', goToInstagram);
function goToInstagram() {
    window.open("https://www.instagram.com/_yahir360/", "_blank");
}

/******************************************************************************
*
* open new tab to squarespace
* 
*****************************************************************************/
squareSpaceLogo.addEventListener('click', goToSquareSpace);
function goToSquareSpace() {
    window.open("https://www.yahir360.com/", "_blank");
}

/******************************************************************************
*
* open new tab to linked in
* 
*****************************************************************************/
linkedinLogo.addEventListener('click', goToLinkedIn);
function goToLinkedIn() {
    window.open("https://www.linkedin.com/in/yahir-rendon-116717218/", "_blank");
}

/******************************************************************************
*
* move to top of page from footer
* 
*****************************************************************************/
topButton.addEventListener('click', goToTop);
function goToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

