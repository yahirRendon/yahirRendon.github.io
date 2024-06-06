/******************************************************************************
*
* javascript for project page
* 
*****************************************************************************/

// get dom elements
const projectCardTemplate = document.querySelector("[data-project-template]")
const projectCardContainer = document.querySelector("[data-project-cards-container]")
const searchInput = document.querySelector("[data-search]")
let projects = []                       // array of projects
let searchActive = false;               // track if search value is > 0 to show project text



/******************************************************************************
*
* run when everything has loaded
* 
*****************************************************************************/
window.onload = function () {
    searchInput.value = ''; // reset the input field within search
}

// window.addEventListener("load", function() { });

/******************************************************************************
*
* get projects from json and populate project cards
* 
*****************************************************************************/
fetch("./data/data-projects.json")
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
            image.style.backgroundImage = "url(./img/" + project.image + ")";
            image.style.cursor = "pointer"


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
                image.children[0].style.opacity = "0";

                if (searchActive) {
                    image.children[0].style.opacity = ".8";
                    name.style.color = "#514a47"
                    description.style.color = "#514a47"
                    tags.style.color = "#514a47"
                }
            }, false);

            // on hover
            card.addEventListener('mouseover', function () {
                // image.children[0].classList.add("white-back");

                image.children[0].style.opacity = ".8";
                image.children[0].style.backgroundColor = "white";
                name.style.color = "#514a47"
                description.style.color = "#514a47"
                tags.style.color = "#514a47"
                // image.children[0].style.backdropFilter = "blur(10px)";
                if (searchActive) {
                    image.children[0].style.opacity = "0";
                    name.style.color = "transparent"
                    description.style.color = "transparent"
                    tags.style.color = "transparent"
                }

                image.children[0].style.transition = "600ms";

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
    });

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

        const textContainer = project.element.children[0].children[0].children[0].children
        // if search active set all to blur and show text
        if (searchActive) {
            project.element.children[0].children[0].children[0].style.transition = "600ms";
            for (let elem of textContainer) {
                project.element.children[0].children[0].children[0].style.backgroundColor = "white";
                elem.style.color = "#514a47"
                project.element.children[0].children[0].children[0].style.opacity = ".8";

            }
            // no blur and no text
        } else {
            for (let elem of textContainer) {
                project.element.children[0].children[0].children[0].style.opacity = "0";
                elem.style.color = "transparent";
                elem.style.transition = "600ms";
            }
        }
    });
});