window.addEventListener('DOMContentLoaded', () => {
    // Normally, you probably wouldn't want to do this as you should be baking in pre-set widths into breakpoints. But
    // this shows how to use getPaddingIf incase you are testing layouts and want to see what the padding 'should' be.
    let variables = document.getElementById('variables');
    let logo = document.querySelector('gr-logo');
    let main = document.querySelector('main');
    let addpadding = function() {
        let padding = logo.getPaddingIf(main.clientWidth, main.clientWidth);
        variables.innerText = `:root {
            --gr-logo-padding: ${padding}px;
            --gr-logo-half-padding: ${padding / 2}px;
            --gr-logo-quarter-padding: ${padding / 4}px;
        }`
    };
    /* Add variables and rate limit to prevent spamming. This should only be a single call. */
    let resize;
    let observer = new ResizeObserver(() => {
        clearTimeout(resize);
        resize = setTimeout(addpadding, 100);
    });
    observer.observe(document.querySelector('main'));


    /* Fill out the options for the controls */
    let fragment = document.createDocumentFragment();
    let themes = Object.getOwnPropertyNames(logo.themes);
    themes.push('random');
    for (let i in themes) {
        let option = document.createElement('option');
        option.value = themes[i];
        option.innerText = themes[i];
        fragment.appendChild(option);
    }
    let themeselect = document.getElementById('theme');
    themeselect.innerHTML = '';
    themeselect.append(fragment);

    /* Add the controls for the logo. */
    let onSelectChange = e => {
        logo.setAttribute('theme', e.target.value);
        fillselect.parentElement.toggleAttribute('disabled', logo.fill === 'disabled')
    };
    themeselect.value = logo.getAttribute('theme');
    themeselect.addEventListener('change', onSelectChange)

    let onFillChange = e => {
        logo.setAttribute('fill', e.target.checked);
    }
    let fillselect = document.getElementById('fill');
    fillselect.checked = logo.hasAttribute('fill');
    fillselect.addEventListener('change', onFillChange);

});