# LearnOffline

A lightweight, offline-first progressive web app (PWA) for students learning in low-connectivity areas. LearnOffline lets learners browse courses, study downloaded lessons, take quizzes, track progress, and sync local activity when a connection returns.

## Features

- Mobile-first, accessible LearnOffline interface
- Course catalogue with lesson progress
- Downloadable lessons for offline study
- Offline quizzes and assignments
- Local progress storage with IndexedDB
- Connection-aware status and queued syncing
- PWA app shell caching through a service worker
- Responsive desktop sidebar and mobile bottom navigation

## Built with

- HTML
- CSS
- Vanilla JavaScript
- IndexedDB
- Service Workers

No frameworks, build tools, or server-side language are required.

## Implementation status and agent handoff

This is an existing PS-07 hackathon project. Preserve working code and continue to use **only HTML, CSS, and vanilla JavaScript** with browser-native APIs. Do not introduce a backend, framework, database service, or build system.

### Completed so far

- Existing IndexedDB-backed courses, lesson progress, quiz results, assignment progress, downloads, local sync queue, and offline search remain in place.
- The interface has been refreshed with the LearnOffline mobile-first design system in `css/style.css`.
- Dashboard hierarchy, navigation active states, focus styles, and live top-bar connection state have been improved.
- A service worker already caches the application shell, and downloaded lesson content is stored in IndexedDB by the existing download flow.
- This README documents the project and its local run requirements.

### Important work still to complete

The project is **not yet feature-complete** against the supplied PS-07 brief. The next agent should work in this order:

1. **Verify and repair real offline downloads first.** Run the required online → download → disable network → refresh → open lesson test. Inspect `js/download.js`, `js/db.js`, `js/app.js`, and `sw.js`. Confirm the downloaded lesson itself, its course context, and any linked quiz are read from IndexedDB without a network request.
2. **Implement proper local authentication.** Replace the current simple profile creation flow with IndexedDB student sign-up, login, persistent session, logout, editable profile, and a clear device-local forgot-password explanation. Validate unique student ID/email, email format, and password requirements. Never expose stored passwords in the UI.
3. **Expand real course content.** Add complete, non-empty Mathematics, Science, English, Tamil, Social Science, Computer Science, and General Knowledge course material. Each course needs multiple chapters/lessons plus appropriate quizzes and assignments; Tamil content must use proper Tamil text.
4. **Extend downloads and storage management.** Support downloaded courses and quizzes as well as lessons; keep removing downloads separate from deleting progress/results.
5. **Validate progress and sync behavior.** Make course progress fully dynamic from lessons, quizzes, and assignments. Keep the sync queue local-only—do not claim cloud/server uploads.
6. **Update PWA details and test the full workflow.** Align `manifest.json` and `sw.js` branding/cache version with LearnOffline, cache required icons, and perform the complete offline persistence test from the brief.

### Verification checklist for the next agent

- Serve the application over `http://localhost` or HTTPS; service workers do not work from `file://`.
- Test using browser DevTools network throttling/offline mode or by disabling the device network.
- Refresh while offline and confirm the app shell loads.
- Open a previously downloaded lesson and quiz while offline; no new network request may be required.
- Submit an offline quiz and assignment, refresh/reopen, and confirm results/progress remain.
- Restore connectivity and confirm the local queue is processed with accurate local-only messaging.
- Re-run JavaScript syntax checks after edits, for example `node --check js/app.js`.

## Run locally

Service workers require the app to be served from a local web server; do not open `index.html` directly from the file system.

From this folder, start any static server. For example, if Node.js is available:

```bash
npx serve .
```

Then open the local address shown by the server, usually `http://localhost:3000`.

## Project structure

```text
.
├── index.html          # Application shell and navigation
├── manifest.json       # PWA metadata
├── sw.js               # Service worker and app-shell cache
├── css/
│   └── style.css       # LearnOffline design system and responsive UI
├── js/
│   ├── app.js          # Views, navigation, and interface behaviour
│   ├── db.js           # IndexedDB setup and seed data
│   ├── courses.js      # Course and lesson access
│   ├── lessons.js      # Lesson progress
│   ├── quiz.js         # Offline quiz results
│   ├── assignments.js  # Assignment progress
│   ├── download.js     # Offline lesson downloads
│   ├── offline.js      # Connection state
│   ├── progress.js     # Learning statistics
│   ├── storage.js      # Storage usage and low-data settings
│   └── sync.js         # Pending activity sync queue
└── assets/             # App icons and static assets
```

## Offline behaviour

The application shell is cached after the first successful visit. Downloaded lessons and learning activity are stored on the device, so students can continue studying while offline. Once online again, queued activity is processed automatically.

## Design principles

LearnOffline uses a calm, high-contrast educational interface designed for low-end Android devices:

- Deep Teal for primary actions and navigation
- Warm Amber for learning milestones and highlights
- Large touch targets and readable type
- Clear online, offline, and syncing states
- Minimal visual clutter and lightweight UI assets
