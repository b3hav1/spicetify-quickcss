(function quickCss() {
    const CONFIG = {
        timeout: 100,
        styleId: "quickcss",
        styleKey: "quickсss",
        stateKey: "quickcss-enabled",

        shortcuts: {
            selectFile: { key: "o", ctrl: true, shift: true },
            toggleCss: { key: "p", ctrl: true, shift: true }
        }
    };


    // #region Init Logic
    // Waiting for Spicetify interface to load
    if (!document.head || !Spicetify?.Keyboard) {
        setTimeout(quickCss, CONFIG.timeout);
        return;
    }

    // Initialize custom CSS and state if exists
    let styleEl = document.getElementById(CONFIG.styleId);
    let isEnabled = localStorage.getItem(CONFIG.stateKey) !== "false";

    // Create <style> tag and load localStorage cache
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.textContent = localStorage.getItem(CONFIG.styleKey) || "";

        styleEl.id = CONFIG.styleId;
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
    async function selectFile() {
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

        localStorage.setItem(CONFIG.stateKey, isEnabled);
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
                localStorage.setItem(CONFIG.styleKey, css);
            }
        }

        catch {
            // Ignore temporary editor file lock
        }

    }, CONFIG.timeout);
    // #endregion


    // #region UI & Hotkeys
    // Show file picker hotkey
    Spicetify.Keyboard.registerShortcut(
        CONFIG.shortcuts.selectFile,
        selectFile
    );

    // Toggle QuickCSS hotkey
    Spicetify.Keyboard.registerShortcut(
        CONFIG.shortcuts.toggleCss,
        toggleCss
    );
    // #endregion
})();
