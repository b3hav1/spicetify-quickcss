(function quickCss() {
    const TIMEOUT = 100;
    const STYLE_ID = "quickcss";
    const STYLE_KEY = "quickcss";
    const STATE_KEY = "quickcss-enabled";


    // #region Init Logic
    // Waiting for Spicetify interface to load
    if (!document.head || !Spicetify?.Keyboard) {
        setTimeout(quickCss, TIMEOUT);
        return;
    }

    // Initialize custom CSS and state if exists
    let styleEl = document.getElementById(STYLE_ID);
    let isEnabled = localStorage.getItem(STATE_KEY) !== "false";

    // Create <style> tag and load localStorage cache
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.textContent = localStorage.getItem(STYLE_KEY) || "";

        styleEl.id = STYLE_ID;
        document.head.appendChild(styleEl);
    }

    // Initialize file API variables and reset state
    let lastModified = 0;
    let fileHandle = null;
    styleEl.disabled = !isEnabled;
    // #endregion


    // #region Core Logic
    // Place tag at very end of <head> section
    const observer = new MutationObserver(() => {
        if (document.head.lastElementChild !== styleEl) {

            document.head.appendChild(styleEl);
            styleEl.disabled = !isEnabled;
        }
    });
    observer.observe(document.head, {childList: true});

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
            if (!isEnabled) toggleCss();
            Spicetify.showNotification(`QuickCSS loaded: ${fileHandle.name}`);
        }

        catch {
            // User closed file picker
        }
    }

    // Toggle QuickCSS using keyboard hotkey
    function toggleCss() {
        isEnabled = !isEnabled;
        styleEl.disabled = !isEnabled;

        localStorage.setItem(STATE_KEY, isEnabled);
        Spicetify.showNotification(`QuickCSS ${isEnabled ? "enabled" : "disabled"}`)
    }

    // Monitor file changes on disk every N ms
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
    // #endregion


    // #region UI & Hotkeys
    // Show file picker hotkey
    Spicetify.Keyboard.registerShortcut({
        key: "o",
        ctrl: true,
        shift: true
    }, showFilePicker);

    // Toggle QuickCSS hotkey
    Spicetify.Keyboard.registerShortcut({
        key: "p",
        ctrl: true,
        shift: true
    }, toggleCss);
    // #endregion
})();
