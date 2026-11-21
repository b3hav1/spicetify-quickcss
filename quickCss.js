(function quickCss() {
    // #region Settings
    const CONFIG = {
        timeout: 100,
        styleId: "quickcss",
        styleKey: "quickсss",
        stateKey: "quickcss-enabled",
        language: "auto",

        shortcuts: {
            selectFile: { key: "o", ctrl: true, shift: true },
            toggleCss: { key: "p", ctrl: true, shift: true }
        }
    };

    const LOCALES = {
        en: {
            pickerDesc: "CSS Files",
            enabled: "QuickCSS enabled",
            disabled: "QuickCSS disabled",
            loaded: (name) => `QuickCSS loaded: ${name}`
        },

        ru: {
            pickerDesc: "CSS-файлы",
            enabled: "QuickCSS включен",
            disabled: "QuickCSS выключен",
            loaded: (name) => `QuickCSS загружен: ${name}`
        },

        de: {
            dialogDesc: "CSS-Dateien",
            enabled: "QuickCSS aktiviert",
            disabled: "QuickCSS deaktiviert",
            loaded: (name) => `QuickCSS geladen: ${name}`
        }
    };
    // #endregion


    // #region Init Logic
    // Waiting for Spicetify interface to load
    if (!document.head || !Spicetify?.Keyboard) {
        setTimeout(quickCss, CONFIG.timeout);
        return;
    }

    // Set extension language from config or Spotify
    const language = CONFIG.lang === "auto"
        ? (Spicetify.Locale?.getLocale?.()?.slice(0, 2) || "en")
        : CONFIG.language;
    const t = LOCALES[language] || LOCALES.en;

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
                types: [{ description: t.pickerDesc,
                accept: {"text/css": [".css"]} }],
                multiple: false
            });

            lastModified = 0;
            if (!isEnabled) toggleCss();
            Spicetify.showNotification(t.loaded(fileHandle.name));
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
        Spicetify.showNotification(isEnabled ? t.enabled : t.disabled);
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
    Spicetify.Keyboard.registerShortcut(
        CONFIG.shortcuts.selectFile,
        selectFile
    );

    Spicetify.Keyboard.registerShortcut(
        CONFIG.shortcuts.toggleCss,
        toggleCss
    );
    // #endregion
})();
