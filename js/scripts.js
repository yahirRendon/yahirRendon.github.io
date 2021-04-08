var goToDesign = document.getElementById('designButton');
var goToAlgo = document.getElementById('algoButton');
var goToData = document.getElementById('dataButton');

if(goToDesign){
    goToDesign.addEventListener("click", openDesign);
}

if(goToAlgo){
    goToAlgo.addEventListener("click", openAlgo);
}

if(goToData){
    goToData.addEventListener("click", openData);
}


function openDesign() {
    window.location.href = "https://yahirrendon.github.io/design.html";
}

function openAlgo() {
    window.location.href = "https://yahirrendon.github.io/algo.html";
}

function openData() {
    window.location.href = "https://yahirrendon.github.io/database.html";
}
