/******************************************************************************
*
* javascript for main web elements
*
* navigation bar
* footer
* top page button
* 
*****************************************************************************/
// get dom elements
const buttonMenu = document.getElementById('menu-button');
const buttonTop = document.getElementById('button-top');

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
* run when everything has loaded
* 
*****************************************************************************/
// window.onload = function () {}
// window.addEventListener("load", function() {});

/******************************************************************************
*
* run when scrolling is occuring
* 
*****************************************************************************/
// window.onscroll = function () { }

/******************************************************************************
*
* trigger when scrolling has ended
* 
*****************************************************************************/
// window.onscrollend = function () { }

/******************************************************************************
*
* run when mouse is moving
* 
*****************************************************************************/
// onmousemove = function (event) { }

/******************************************************************************
*
* Toggle elements when menu-button clicked in navigation 
* 
*****************************************************************************/
buttonMenu.addEventListener('click', function () {
    menuButtonToggle();
    navigationBarToggle();
});

/******************************************************************************
*
* Toggle animation for hamburger icon in menu
* 
*****************************************************************************/
function menuButtonToggle() {
    // var doit = 0;
    let hambars = document.getElementsByClassName('cont-bar')[0].children;

    for (var i = 0; i < hambars.length; i++) {
        hambars[i].classList.toggle('trig');

        if (!hambars[i].classList.contains('trig')) {
            hambars[i].classList.toggle('trig-r');
        }

        if (hambars[i].classList.contains('trig') && hambars[i].classList.contains('trig-r')) {
            hambars[i].classList.toggle('trig-r');
        }
    }
}

/******************************************************************************
*
* Toggle the menu links in navigation
* 
*****************************************************************************/
// function navigationBarToggle() {
//     let navElem = document.getElementsByClassName('toggle-show');
//     for (var i = 0; i < navElem.length; i++) {
//         let navStyle = window.getComputedStyle(navElem[i], null);
//         let navStyleDisplay = navStyle.getPropertyValue('display');

//         if (navStyleDisplay == 'none') {
//             navElem[i].style.display = 'grid';
//             navElem[i].classList.remove('fadeOut-mod');
//             void navElem[i].offsetWidth; // trigger reflow
//             navElem[i].classList.add('fadeIn-mod');

//         } else {
//             navElem[i].classList.remove('fadeIn-mod');
//             void navElem[i].offsetWidth; // trigger reflow
//             navElem[i].classList.add('fadeOut-mod');
//         }
//     }
// }

function navigationBarToggle() {
    let navElems = document.getElementsByClassName('toggle-show');
    for (let i = 0; i < navElems.length; i++) {
        let navStyle = window.getComputedStyle(navElems[i]);
        if (navStyle.getPropertyValue('display') === 'none') {
            navElems[i].style.display = 'grid';
            navElems[i].classList.remove('fadeOut-mod');
            // force reflow
            void navElems[i].offsetWidth;
            navElems[i].classList.add('fadeIn-mod');
        } else {
            navElems[i].classList.remove('fadeIn-mod');
            // force reflow
            void navElems[i].offsetWidth;
            navElems[i].classList.add('fadeOut-mod');

            console.log("timeout start");
            // fallback: Remove the element from view after the animation
            setTimeout(function(elem) {
                console.log("timeout complete");
                elem.style.display = 'none';
            }, 750, navElems[i]);
        }
    }
}

/******************************************************************************
*
* Toggle animation for hamburger icon in menu
* 
*****************************************************************************/
function resetMenu() {
    let hambars = document.getElementsByClassName('cont-bar')[0].children;

    for (var i = 0; i < hambars.length; i++) {
        hambars[i].classList.remove('trig');
        hambars[i].classList.add('trig-r');
    }

    let navElem = document.getElementsByClassName('toggle-show');
    for (var i = 0; i < navElem.length; i++) {
        let navStyle = window.getComputedStyle(navElem[i], null);
        let navStyleDisplay = navStyle.getPropertyValue('display');

            navElem[i].classList.remove('fadeIn-mod');
            void navElem[i].offsetWidth; // trigger reflow
            navElem[i].classList.add('fadeOut-mod');
    }
}

/******************************************************************************
*
* run when animation for first element in toggle-show group is over
* 
*****************************************************************************/
// document.getElementsByClassName('toggle-show')[0].addEventListener("animationend", function () {
//     let navElem = document.getElementsByClassName('toggle-show');

//     if (navElem[0].classList.contains('fadeOut-mod')) {
//         for (var i = 0; i < navElem.length; i++) {
//             let navStyle = window.getComputedStyle(navElem[i], null);
//             let navStyleDisplay = navStyle.getPropertyValue('display');

//             navElem[i].style.display = 'none';
//         }
//     }
// }, false);

const navToggleEl = document.getElementsByClassName('toggle-show')[0];

function onAnimationEnd() {
    let navElem = document.getElementsByClassName('toggle-show');
    if (navElem[0].classList.contains('fadeOut-mod')) {
        for (let i = 0; i < navElem.length; i++) {
            navElem[i].style.display = 'none';
        }
    }
}

navToggleEl.addEventListener("animationend", onAnimationEnd, false);
navToggleEl.addEventListener("webkitAnimationEnd", onAnimationEnd, false);


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

