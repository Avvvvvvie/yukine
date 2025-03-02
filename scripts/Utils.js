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