//=============================================================================
// scripts for projects page
//=============================================================================

// global 
const projectCardTemplate = document.querySelector("[data-project-template]")
const projectCardContainer = document.querySelector("[data-project-cards-container]")
const searchInput = document.querySelector("[data-search]")
let projects = []                   // array of projects
let searchActive = false;               // track if search value is > 0 to show project text

/*
* run when window loads
*/
window.onload = function () {
}

/*
* simple way to check if page arrived at by
* back button. reset nav to default
*/
window.onpageshow = function (event) {
    if (event.persisted) {
        // window.location.reload();
        resetMenu();
    }
};

/**
 * Toggle elements when menu-button clicked in navigation 
 */
document.getElementById('menu-button').addEventListener('click', function () {
    navigationBarToggle();
    toggleHamIcon();
});

/**
 * Toggle the menu links in navigation
 */
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
/**
 * Toggle animation for hamburger icon in menu
 */
function toggleHamIcon() {
    // toggle hamburger icon bars given current state
    let barElems = document.getElementsByClassName('ham-container');
    for (var i = 0; i < barElems.length; i++) {
        barElems[i].classList.toggle('change');
    }
}
/*
* reset menu to default state
*/
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

/**
 * move to top of page from footer
 */
document.getElementById('top-button').addEventListener('click', goToTop);
function goToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}


//=============================================================================
// loading and events for projects
//=============================================================================

/**
 * get projects from json and populate project cards
 */
fetch("../data/data-projects.json")
    .then(res => res.json())
    .then(data => {
        projects = data.map(project => {
            const card = projectCardTemplate.content.cloneNode(true).children[0]
            var image = card.querySelector("[data-image]")
            const name = card.querySelector("[data-name]")
            const description = card.querySelector("[data-description]")
            const tags = card.querySelector("[data-tags]")
            const id = project.id

            // set image
            image.style.backgroundImage = "url(../img/" + project.image + ")"
            image.style.cursor = "pointer"
            // bck.style.backgroundImage = "url(evie-s-uuCjYxJVf4o-unsplash.jpg)";
            // image.style.backgroundImage = "linear-gradient( rgba(0,0,0,.25), rgba(0,0,0,.25) ), url(../img/evie-s-uuCjYxJVf4o-unsplash.jpg)"

            // format and update tags
            name.textContent = project.name
            description.textContent = project.description
            let tagsText = "";
            for (var i = 0; i < project.tags.length; i++) {
                tagsText += project.tags[i]
                if (i < project.tags.length - 1) {
                    tagsText += " • "
                }
            }
            tags.textContent = tagsText

            let imageColor = project.color;

            // mouse exits card
            card.addEventListener('mouseout', function () {
                // when search is active set back to blur and show text
                if(searchActive) {
                    if (imageColor == 0) {
                        name.style.color = "black"
                        description.style.color = "black"
                        tags.style.color = "black"
    
                    } else {
                        name.style.color = "white"
                        description.style.color = "white"
                        tags.style.color = "white"
    
                    }
                    image.children[0].style.backdropFilter = "blur(10px)"
                    image.children[0].style['-webkit-backdrop-filter'] = "blur(10px)"
                }

                // when not searching set to transparent with no blue
                if (!searchActive) {
                    name.style.color = "transparent"
                    description.style.color = "transparent"
                    tags.style.color = "transparent"
                    image.children[0].style.backdropFilter = "none"
                    image.children[0].style['-webkit-backdrop-filter'] = "none"
                               
                }
                name.style.transition = "color 600ms"
                description.style.transition = "color 600ms"
                tags.style.transition = "color 600ms"
                image.children[0].style.transition = "backdrop-filter 600ms"
                image.children[0].style['-webkit-transition'] = "backdrop-filter 600ms" 
            }, false);

            // on hover
            card.addEventListener('mouseover', function () {
                // set text color based on project color
                if (imageColor == 0) {
                    name.style.color = "black"
                    description.style.color = "black"
                    tags.style.color = "black"

                } else {
                    name.style.color = "white"
                    description.style.color = "white"
                    tags.style.color = "white"

                }

                // if search is active remove blur and text on mouseover
                if(searchActive) {
                    image.children[0].style.backdropFilter = "none"
                    name.style.color = "transparent"
                    description.style.color = "transparent"
                    tags.style.color = "transparent"
                } else {
                    image.children[0].style.backdropFilter = "blur(10px)"
                    image.children[0].style['-webkit-backdrop-filter'] = "blur(10px)"
                }

                name.style.transition = "color 600ms"
                description.style.transition = "color 600ms"
                tags.style.transition = "color 600ms"
                image.children[0].style.transition = "backdrop-filter 600ms"
                image.children[0].style['-webkit-transition'] = "backdrop-filter 600ms"
 
            }, false);

            /**
             * onclick go to link
             */
            card.addEventListener('click', function () {
                window.location.href = project.website;
            }, false);

            // pass card to container
            projectCardContainer.append(card)
            return { id: project.id, name: project.name, description: project.description, tags: project.tags, color: project.color, element: card }
        })
    })

/**
 * onclick the search input feature
 * 
 * search through name and tags
 */
searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase()

    if (value.length > 0) {
        searchActive = true;
    } else {
        searchActive = false;
    }

    // loop through projects
    projects.forEach(project => {

        // convert tags into a string that can be searched for
        let tags = ""
        project.tags.forEach(tag => {
            tags += tag.toLocaleLowerCase() + " "
        });

        const isVisible = tags.includes(value) || project.name.toLowerCase().includes(value)
        project.element.classList.toggle("hide", !isVisible)

        const textContainer = project.element.children[0].children[0].children
        // if search active set all to blur and show text
        if (searchActive) {
            for (let elem of textContainer) {        
                project.element.children[0].children[0].style.backdropFilter = "blur(10px)"
                project.element.children[0].children[0].style['-webkit-backdrop-filter'] = "blur(10px)"
                
                if (project.color == 0) {
                    elem.style.color = "black"      
                    elem.style.transition = "color 600ms"
                } else {
                    elem.style.color = "white"
                    elem.style.transition = "color 600ms"
                }
            }
        // no blur and no text
        } else {
            for (let elem of textContainer) {
                project.element.children[0].children[0].style.backdropFilter = "none"
                project.element.children[0].children[0].style.transition = "backdrop-filter 600ms"
                project.element.children[0].children[0].style['-webkit-backdrop-filter'] = "none"
                project.element.children[0].children[0].style['-webkit-transition'] = "backdrop-filter 600ms"
                
                elem.style.color = "transparent"
                elem.style.transition = "color 600ms"
            }
        }
    })
})
