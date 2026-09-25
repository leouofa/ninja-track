# Ninja Track

**Build better habits without the overwhelm.**

Most habit trackers want you to log duration, intensity, and targets. Ninja Track
doesn't. You name the things that matter, tap them when you do them, and watch
the momentum build.

- **Music** → Piano
- **Health** → Cooking
- **Fitness** → Running

That's the whole model.

## Features

- **Categories** — organize your life into areas (Music, Health, Fitness, Learning…)
- **Tasks** — simple named actions, no durations or targets to agonize over
- **One-tap completion** — mark it done when you do it
- **Progress reports** — stacked bar charts grouped by day, week, or month, with
  completion rates and streaks across every life area
- **Daily reminders** — a single scheduled local notification at the time you pick
- **CSV export** — share your full history as `ninja-track-data-<timestamp>.csv`
- **Light & dark** — follows your system appearance
- **Cross-platform** — iOS, Android, and web from one Expo codebase

## Your data stays on your device

This is the part that matters most, so it's worth being specific:

- **No account, no server, no sync.** Ninja Track has no backend. There is nowhere
  for your data to go.
- **No network requests.** The app code makes zero outbound requests — no
  `fetch`, no analytics, no crash reporting, no telemetry. (The Android manifest
  does declare a default `INTERNET` permission, inherited from `expo-file-system`
  for the CSV export. Nothing in the app ever uses it.)
- **Everything is local.** Categories, tasks, completions, and reminder settings
  live in on-device `AsyncStorage` under four `@ninja_track_*` keys.
- **Reminders are scheduled locally** on the device, not pushed through a server.
  No push tokens, no notification relay.
- **You can leave anytime.** Uninstalling removes everything, and CSV export means
  you always have a copy.

## Getting started

Requires Node 18+ and the Expo CLI.

```bash
git clone https://github.com/ninja-in-brazil/ninja-track.git
cd ninja-track
npm install
npx expo start
```

Then press `i` for the iOS simulator, `a` for Android, `w` for web, or scan the
QR code with Expo Go.

To run against a native development build instead:

```bash
npm run ios
npm run web
npm run lint
```

## Building

The project uses [Expo prebuild](https://docs.expo.dev/workflow/prebuild/), so
the `ios/` and `android/` directories are **not** committed — they're generated
from `app.json` at build time. EAS build profiles live in `eas.json`:

```bash
eas build -p ios --profile preview      # internal distribution
eas build -p ios --profile production
eas build -p android --profile production
```

Contributors won't have native projects checked in; run `npx expo prebuild` first
if you need to work on native code.

## Project structure

```
app/                    # expo-router file-based routes
  index.tsx             # home — task list & completion
  reports.tsx           # progress charts
  settings/             # categories, tasks, reminders
components/             # StackedBarChart, TimeGroupingToggle
utils/                  # AsyncStorage adapters, reports, export, notifications
assets/                 # icons and splash
```

Routing is file-based via [Expo Router](https://docs.expo.dev/router/introduction/),
so a file in `app/` *is* a route.

## Contributing

Issues and bug reports are welcome — please [open an issue](https://github.com/ninja-in-brazil/ninja-track/issues).

## License

[MIT](LICENSE) © 2026 Leonid Medovyy
