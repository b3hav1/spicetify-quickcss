# Spicetify QuickCSS

![Preview](preview.gif)

A lightweight, zero-dependency **Spicetify extension** for live-reloading custom CSS in Spotify without restarting the client. **Why QuickCSS instead of built-in Snippets?** - They are lacks for active development because editing inside the built-in modal lacks syntax highlighting, autosuggestion, formatting, and proper search/replace.

## Features

* **Instant Hot-Reload:** Automatically polls your selected `.css` file and injects changes on file save.
* **Persistent Cache:** Saves your latest CSS into `localStorage` so styles apply immediately on startup.
* **Priority Override:** Uses a `MutationObserver` to ensure your rules take precedence over theme styles.
* **Zero Dependencies:** Written in pure vanilla JavaScript utilizing the native **File System Access API**.

## Installation

Make sure you have **Spicetify client** installed, then:

1. Download `quickCss.js` from this repository.
2. Place the script into your Extensions folder:
    * **Windows:** `%appdata%/spicetify/Extensions/`
    * **Linux/macOS:** `~/.config/spicetify/Extensions/`
3. Enable the extension and apply Spicetify changes:

```sh
spicetify config extensions quickCss.js
spicetify apply
```

## Usage

**This extension does not include any built-in themes** - it is strictly a loader utility. You need to provide your own `.css` file to apply any visual changes.

1. Focus the Spotify window and press `Ctrl+Shift+O`.
2. Select your local `.css` file from the file picker dialog.
3. A toast notification (`QuickCSS loaded: <filename>.css`) will confirm is loaded.
4. Edit and save the file in your preferred editor - Spotify will refreshed automatically.

## Limitations

* **Restricted Directories:** Due to **File System Access API** security sandbox, files can only be loaded from standard user directories (e.g. `Desktop`, `Documents`, `Downloads`) or a custom folder in your home.
* **Session Persistence:** While your CSS remains applied after a Spotify restart via `localStorage`, the active file handle is lost. Press `Ctrl+Shift+O` again and select file.

## License

Copyright (c) 2026 b3hav1

This repository is licensed under the [MIT License](LICENSE).
