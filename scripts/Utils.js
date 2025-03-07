function createDiv(...classes) {
    let element = document.createElement('div');
    element.classList.add(...classes);
    return element;
}

function asyncTimeout(ms){
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function showElement(element) {
    element.setAttribute('visible', "true");
}
function hideElement(element) {
    element.setAttribute('visible', "false");
}