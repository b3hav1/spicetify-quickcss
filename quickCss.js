(function quickCss() {
    const TIMEOUT = 100;
    const STYLE_ID = "quickcss";
    const STYLE_KEY = "quickcss";
    const STATE_KEY = "quickcss-enabled";

    // Waiting for Spicetify interface to load
    if (!document.head || !Spicetify?.Keyboard) {
        setTimeout(quickCss, TIMEOUT);
        return;
    }

    let lastModified = 0;
    let fileHandle = null;
    let styleEl = document.getElementById(STYLE_ID);

    // Create <style> tag and load localStorage cache
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.textContent = localStorage.getItem(STYLE_KEY) || "";

        styleEl.id = STYLE_ID;
        document.head.appendChild(styleEl);
    }

    let isEnabled = localStorage.getItem(STATE_KEY) !== "false";
    styleEl.disabled = !isEnabled;

    // Place tag at very end of <head> section
    const observer = new MutationObserver(() => {
        if (document.head.lastElementChild !== styleEl) {

            document.head.appendChild(styleEl);
            styleEl.disabled = !isEnabled;
        }
    });
    observer.observe(document.head, {childList: true});

    // Toggle QuickCSS using keyboard hotkey
    function toggleCss() {
        isEnabled = !isEnabled;
        styleEl.disabled = !isEnabled;

        localStorage.setItem(STATE_KEY, isEnabled);
        Spicetify.showNotification(`QuickCSS ${isEnabled ? "enabled" : "disabled"}`)
    }

    // Select CSS file via file system dialog
    async function showFilePicker() {
        try {
            [fileHandle] = await window.showOpenFilePicker
            ({
                types: [{ description: "CSS Files",
                accept: {"text/css": [".css"]} }],
                multiple: false
            });

            lastModified = 0;
            Spicetify.showNotification(`QuickCSS loaded: ${fileHandle.name}`);
        }

        catch {
            // User closed file picker
        }
    }

    // Show file picker hotkey (Ctrl+Shift+O)
    Spicetify.Keyboard.registerShortcut({
        key: "o",
        ctrl: true,
        shift: true
    }, showFilePicker);

    // Toggle QuickCSS hotkey (Ctrl+Shift+P)
    Spicetify.Keyboard.registerShortcut({
        key: "p",
        ctrl: true,
        shift: true
    }, toggleCss);

    // Monitor file changes on disk every TIMEOUT ms
    setInterval(async() => {
        if (!fileHandle) return;

        try {
            const file = await fileHandle.getFile();
            if (file.lastModified !== lastModified) {

                lastModified = file.lastModified;
                const css = await file.text();

                styleEl.textContent = css;
                localStorage.setItem(STYLE_KEY, css);
            }
        }

        catch {
            // Ignore temporary editor file lock
        }

    }, TIMEOUT);
})();
