# Roulette App

A simple cross-platform desktop application built with Tauri and Vanilla HTML, CSS, and JavaScript.
The app lets users create a customizable roulette wheel, add or remove options, and spin the wheel to pick a random choice.

This project was created as a lightweight decision-making tool and as a learning exercise in combining frontend web development with Tauri desktop packaging.

## Features

- Add and remove custom options dynamically.
- Wheel spins multiple times with smooth easing animation.
- Prevents edits while spinning for better UX.
- Spin button is disabled while the wheel is in motion.
- Long option names are truncated to avoid overlap.
- Automatic scroll to wheel when spinning starts.
- Fully localized frontend in Spanish.
- Options persist using local storage.
- Cross-platform: runs on Windows, macOS, and Linux.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Rust
- (Windows only) Visual Studio Build Tools
 with C++ workload

### Installation

#### Clone the repository:

```
git clone https://github.com/Danteurus/Roulette.git
cd Roulette
```

#### Install dependencies:

```
npm install
```

#### Run in development:

```
npm run tauri dev
```

This will open the app in a desktop window with hot reload.

#### Build for production:

```
npm run tauri build
```

The compiled installers/executables will be available under:

```
src-tauri/target/release/bundle/
```

# Project Structure

```
Roulette/
├── src/                 # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── main.js
│   └── styles.css
├── src-tauri/           # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   └── tauri.conf.json
├── package.json
└── README.md
```

# Development Notes

- The frontend is written in plain HTML/CSS/JS to keep the project lightweight.
- Tauri is used to package the frontend into a native desktop app.
- Options are saved locally via localStorage.