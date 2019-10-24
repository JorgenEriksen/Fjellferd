
// navbar
let element = document.querySelector("#icon");
element.addEventListener("click", e => {
    navigation = document.querySelectorAll("#navigation a:not(#icon)");
    navigation.forEach(a => {
        a.classList.toggle("display-block");
    });
})

// tilbake knappen
function goBack() {
    window.history.back();
  }