function initNav() {
    fetch('nav.html')
        .then(res => res.text())
        .then(text => {
            let oldelem = document.querySelector("nav#navbar");
            oldelem.innerHTML = text;
        });
}