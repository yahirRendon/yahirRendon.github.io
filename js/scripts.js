
var goToDesign = document.getElementById('designButton');

if(goToDesign){
    goToDesign.addEventListener("click", openDesign);
}

function openDesign() {
    window.location.href = "design.html";
}
