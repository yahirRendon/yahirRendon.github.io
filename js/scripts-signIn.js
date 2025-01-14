// sign in input fields
var firstNameInput = document.getElementById("f-name");
var lastNameInput = document.getElementById("l-name");
var emailInput = document.getElementById("g-email");

// submit, view guests, and copy buttons
var submitButton = document.getElementById("submit-button");
var viewGuestsButton = document.getElementById("view-guests-button");
var copyDataButton = document.getElementById("copy-data-button");
var topOfPageButton = document.getElementById("to-topOfPage-button");

var formContainer = document.getElementsByClassName("form-container")[0];
var welcomeMessageDiv = document.getElementsByClassName("welcome-msg")[0];

// guest numbers/data
var guestStatistics = document.getElementById("guest-stats");
var guestWrapper = document.getElementsByClassName("guest-wrapper")[0];

// guest card template
const guestCardTemplate = document.querySelector("[data-guest-template]")
const guestCardContainer = document.querySelector("[data-guest-cards-container]")

// track if first name and last name fields are empty
var firstNameEmpty = true;
var lastNameEmpty = true;

// track if paid status us updated 
var clickCount = 0;
var lastClickTime = 0;

// holds array of guests
var guestListData = [];

/**
 * 
 * when the content has loaded run function
 * 
 */
document.addEventListener('DOMContentLoaded', function () {
    // clear input fields
    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";

    inputValid();
    hideGuests();

    // if data already within local storage set data to guestlist
    if (localStorage.getItem("guestListData") !== null) {
        guestListData = JSON.parse(localStorage.getItem("guestListData"));
    }
}, false);

/**
 * When sign in button is hit run the necessary functions to
 * add guest to guestList array, local storage, and card append
 */
submitButton.addEventListener("click", function () {
    if (inputValid()) {
        // hide form container and display welcome div
        formContainer.style.display = "none";

        // let elem2 = document.getElementsByClassName("test")[0];
        // elem2.classList.add("test-show");
        welcomeMessageDiv.classList.add("show-welcome");

        saveGuestInfo();
        timetest();
    } else {
        // focus on first name field if empty
        if (firstNameEmpty) {
            firstNameInput.focus();
        }

        // focus on last name field if empty
        if (lastNameEmpty) {
            lastNameInput.focus();
        }
    }
});

/**
 * 
 * Check if first name field is empty on input changes
 * 
 */
firstNameInput.addEventListener("input", function () {
    firstNameEmpty = (firstNameInput.value.length > 0) ? false : true;
    // if (firstNameInput.value.length > 0) {
    //     firstNameEmpty = false;
    // } else {
    //     firstNameEmpty = true;
    // }
    inputValid();
});

/**
 * 
 * Check if last name field is empty on input changes
 * 
 */
lastNameInput.addEventListener("input", function () {
    lastNameEmpty = (lastNameInput.value.length > 0) ? false : true;
    // if (lastNameInput.value.length > 0) {
    //     lastNameEmpty = false;
    // } else {
    //     lastNameEmpty = true;
    // }
    inputValid();
});

/**
 * 
 * check that both first and last name fields are not empty
 * 
 * @returns true when first and last name fields are not empty
 * 
 */
function inputValid() {
    return (firstNameEmpty || lastNameEmpty) ? false : true;

    // if (fNameEmpty || lNameEmpty) {
    //     return false;
    //     // submitButton.style.visibility = "hidden";
    // } else {
    //     // submitButton.style.visibility = "visible"
    //     return true;
    // }
}

/**
 * 
 * timeout function to show and hide guest sign in vs welcome statement
 * 
 */
function timetest() {
    setTimeout(
        function () {
            welcomeMessageDiv.innerHTML = "";
            welcomeMessageDiv.classList.add("hide");
            welcomeMessageDiv.classList.remove("show-welcome");

            formContainer.style.display = "grid";
        }, 3000);
}

/**
 * 
 * function for gathering guest info and adding to guestList,
 * local storage, and appending to display card
 * 
 */
function saveGuestInfo() {
    // guest info from input fields
    let firstName = firstNameInput.value;
    let lastName = lastNameInput.value;
    let numKids = 0;
    let email = emailInput.value;

    // update welcome div
    welcomeMessageDiv.innerHTML = "Welcome, " + firstName + "!";

    // validation check: first or last name are not empty strings
    // *sign in button will not be displayed otherwise
    if (firstName.length > 0 && lastName.length > 0) {
        let guest = {
            "fname": firstName,
            "lname": lastName,
            "kids": numKids,
            "email": email,
            "paid": 0
        };

        // push info to guestList and then local storage
        guestListData.push(guest)
        let string = JSON.stringify(guestListData)
        localStorage.setItem("guestListData", string)

        // clear input fields
        firstNameInput.value = "";
        lastNameInput.value = "";
        emailInput.value = "";

        guestCardContainer.innerHTML = '';
        guestWrapper.style.display = "none";

        if (firstName === "YR" && lastName === "AG" && email === "deleteThisNow!") {
            localStorage.clear();
            guestListData = [];
            guestCardContainer.innerHTML = '';
            
            guestStatistics.innerHTML = "Guests: 0" +
                "&nbsp&nbsp&nbsp&nbsp&nbsp Paid: 0" +
                "&nbsp&nbsp&nbsp&nbsp&nbsp Kids: 0";

            hideGuests();
            welcomeMessageDiv.innerHTML = "Data Deleted!";
            // alert("Data Deleted!")
        }
    }
}

/**
 * 
 * View guest information button
 * 
 */
viewGuestsButton.addEventListener("click", function () {
    if (toggleView()) {
        displayGuests();
        guestWrapper.scrollIntoView({ behavior: 'smooth', block: 'start'});  
    } else {
        hideGuests();
    }
});

function toggleView() {
    const currentTime = new Date().getTime();
    let validClicks = false;

    // Check if the time difference between this click and the last one is within 200ms
    if (currentTime - lastClickTime <= 200) {
        clickCount++;
    } else {
        clickCount = 1;  // Reset if the interval is greater than 200ms
    }

    // If the button has been clicked 3 times within 200ms intervals
    if (clickCount === 3) {
        validClicks = true;
        clickCount = 0;  // Reset count after success
    }
    lastClickTime = currentTime;  // Update the last click time

    return validClicks;
}

function displayGuests() {

    // show these elements

    guestWrapper.style.display = "grid";

    // delete child elements
    guestCardContainer.innerHTML = '';

    // get guestList from local storage
    var tempData = JSON.parse(localStorage.getItem("guestListData"));

    let totalGuests = 0;
    let paidGuests = 0;
    let totalKids = 0;

    // loop through guestList data from storage
    if (tempData != null) {
        for (let index = tempData.length - 1; index >= 0; index--) {
            const element = tempData[index];
            const card = guestCardTemplate.content.cloneNode(true).children[0]
            const name = card.querySelector("[data-name]")
            // const lname = card.querySelector("[data-lname]")
            const email = card.querySelector("[data-email]")
            const kids = card.querySelector("[data-kids]")
            const paid = card.querySelector("[data-paid]")

            name.textContent = element.fname + " " + element.lname;
            email.textContent = element.email;

            kids.textContent = "";

            if (element.kids != 0) {
                kids.textContent = "+" + element.kids;
            }

            // show paid as X or check mark
            let paidText = "&#66338";
            paid.style.color = "red"
            if (element.paid == 1) {
                paidText = "&#10003";
                paid.style.color = "green";
            }
            paid.innerHTML = paidText;

            /**
             * onclick update paid section
             */
            paid.addEventListener('click', function () {
                // how to show paid?
                // element.paid = 1;

                guestListData[index].paid += 1;
                if (guestListData[index].paid > 1) {
                    guestListData[index].paid = 0;
                }

                var string = JSON.stringify(guestListData)
                localStorage.setItem("guestListData", string)
                // paidUpdate = true;
                displayGuests();

            }, false);

            kids.addEventListener('click', function() {
                guestListData[index].kids = (guestListData[index].kids > 4) ? guestListData[index].kids = 0 : guestListData[index].kids += 1;

                var string = JSON.stringify(guestListData)
                localStorage.setItem("guestListData", string)
                // paidUpdate = true;
                displayGuests();
            }, false);

            // update guest statestics
            totalGuests += (1 + parseInt(element.kids));
            if (element.paid == 1) {
                paidGuests += 1;
            }
            totalKids += (parseInt(element.kids));

            
            guestStatistics.innerHTML = "Guests: " + totalGuests.toString() +
                "&nbsp&nbsp&nbsp&nbsp&nbsp Paid: " + paidGuests.toString() +
                "&nbsp&nbsp&nbsp&nbsp&nbsp Kids: " + totalKids.toString();

 
            guestCardContainer.append(card);
            
        }
    }

    guestStatistics.innerHTML = "Guests: " + totalGuests.toString() +
                "&nbsp&nbsp&nbsp&nbsp&nbsp Paid: " + paidGuests.toString() +
                "&nbsp&nbsp&nbsp&nbsp&nbsp Kids: " + totalKids.toString();
}

/**
 * 
 * hide the guest list
 * 
 */
function hideGuests() {
    guestWrapper.style.display = "none";
    // copyButton.style.display = "none";

    // delete child elements
    guestCardContainer.innerHTML = '';
}

topOfPageButton.addEventListener("click", function () {
    
    viewGuestsButton.scrollIntoView({ behavior: 'smooth', block: 'start'}); 
    hideGuests();
   
});

copyDataButton.addEventListener("click", function () {
    copyGuestToClipboard();
});


function copyGuestToClipboard() {
    // Get the text field
    let tempData = JSON.parse(localStorage.getItem("guestListData"))
    let copyText = "first_name,last_name,email,kids,paid" + "\n";

    if (tempData != null) {
        for (let index = tempData.length - 1; index >= 0; index--) {
            const element = tempData[index];
            copyText += element.fname + ",";
            copyText += element.lname + ",";
            copyText += element.email + ",";
            copyText += element.kids + ",";
            if (element.paid == 0) {
                copyText += "unpaid";
            } else {
                copyText += "paid";
            }
            copyText += "\n";
        }
    }

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText);

    // Alert the copied text
    //   alert("Copied the text: " + copyText);
}
