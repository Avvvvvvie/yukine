
const yukine = new Yukine();

document.addEventListener('DOMContentLoaded', function() {
    pages.DOMContentLoaded();

    // select
    // Iterate over each select element
    let selects = document.querySelectorAll('select');
    selects.forEach((select) => {
        // Cache the number of options
        let $select = select;
        let numberOfOptions = $select.options.length;

        // Hides the select element
        $select.classList.add('s-hidden');

        // Wrap the select element in a div
        // create wrapper container
        let wrapper = document.createElement('div');
        wrapper.classList.add('select');

        // insert wrapper before el in the DOM tree
        $select.parentNode.insertBefore(wrapper, $select);

        // move el into wrapper
        wrapper.appendChild($select);

        // Insert a styled div to sit over the top of the hidden select element
        let styledSelect = document.createElement('div');
        styledSelect.classList.add('styledSelect');
        $select.after(styledSelect);

        // Show the first select option in the styled div
        styledSelect.innerText = $select.options[0].innerText;

        // Insert an unordered list after the styled div and also cache the list
        let list = document.createElement('ul');
        list.classList.add('options');
        styledSelect.after(list);

        // Insert a list item into the unordered list for each select option
        for (let i = 0; i < numberOfOptions; i++) {
            let listItem = document.createElement('li');
            listItem.classList.add('option');
            listItem.innerText = $select.options[i].innerText;
            listItem.setAttribute('rel', $select.options[i].value);
            list.appendChild(listItem);
            listItem.addEventListener('click',function(e) {
                e.stopPropagation();
                styledSelect.innerText = this.innerText;
                $select.value = this.getAttribute('rel');
                styledSelect.classList.remove('active');
                const ev = new Event('change');
                $select.dispatchEvent(ev);
            })
        }

        // Show the unordered list when the styled div is clicked (also hides it if the div is clicked again)
        styledSelect.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });

        // Hides the unordered list when clicking outside of it
        document.addEventListener('click',function() {
            styledSelect.classList.remove('active');
        });
    });

    // input
    let numberInputs = document.querySelectorAll('.number-input');
    numberInputs.forEach((numberInput) => {
        let input = numberInput.querySelector('input[type="number"]');
        numberInput.querySelector('.plus').addEventListener('click', function() {
            input.stepUp();
            const ev = new Event('change');
            input.dispatchEvent(ev);
        });
        numberInput.querySelector('.minus').addEventListener('click', function() {
            input.stepDown();
            const ev = new Event('change');
            input.dispatchEvent(ev);
        });
    });
});