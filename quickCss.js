(function quickCss() {
    const TIMEOUT = 100;
    const STYLE_ID = "quickcss";
    const STORAGE_KEY = "quickcss";

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
        styleEl.textContent = localStorage.getItem(STORAGE_KEY) || "";

        styleEl.id = STYLE_ID;
        document.head.appendChild(styleEl);
    }

    // Place tag at very end of <head> section
    const observer = new MutationObserver(() => {
        if (document.head.lastElementChild !== styleEl) {
            document.head.appendChild(styleEl);
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
            Spicetify.showNotification(`QuickCSS loaded: ${fileHandle.name}`);
        }

        catch {
            // User closed file picker
        }
    }

    // Register global hotkey (Ctrl+Shift+O)
    Spicetify.Keyboard.registerShortcut({
        key: "o",
        ctrl: true,
        shift: true
    }, showFilePicker);

    // Monitor file changes on disk every TIMEOUT ms
    setInterval(async() => {
        if (!fileHandle) return;

        try {
            const file = await fileHandle.getFile();
            if (file.lastModified !== lastModified) {

                lastModified = file.lastModified;
                const css = await file.text();

                styleEl.textContent = css;
                localStorage.setItem(STORAGE_KEY, css);
            }
        }

        catch {
            // Ignore temporary editor file lock
        }

    }, TIMEOUT);
})();
