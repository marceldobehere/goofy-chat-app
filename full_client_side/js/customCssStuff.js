function applyCss(css)
{
    if (!css)
        css = "";

    let customCss = document.getElementById("custom-css");
    customCss.innerHTML = css;
}

function loadAndApplyStoredCss()
{
    let customCss = loadObject("CUSTOM_CSS");
    if (!customCss)
    {
        customCss = "";
        saveObject("CUSTOM_CSS", customCss);
    }

    let customCssInput = document.getElementById("custom-css-input");
    customCssInput.value = customCss;

    applyCss(customCss);
}

function saveAndApplyCss()
{
    let customCssInput = document.getElementById("custom-css-input");
    let customCss = customCssInput.value;

    saveObject("CUSTOM_CSS", customCss);
    applyCss(customCss);
}


document.getElementById('custom-css-input').
addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();

        saveAndApplyCss();
        return;
    }

    if (e.key != 'Tab')
        return;

    e.preventDefault();
    let start = this.selectionStart;
    let end = this.selectionEnd;

    let startOffset = 0;

    if (e.shiftKey)
    {
        // check if there is a tab before the previous new line
        let prevNewLine = this.value.lastIndexOf("\n", start - 1);
        let prevTab = this.value.lastIndexOf("\t", start - 1);
        if (prevTab > prevNewLine)
        {
            // remove the tab
            this.value = this.value.substring(0, prevTab) + this.value.substring(prevTab + 1);
            startOffset = -1;
        }
    }
    else
    {
        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

        startOffset = 1;
    }


    // put caret at right position again
    this.selectionStart = this.selectionEnd = start + startOffset;
});