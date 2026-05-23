<div align="center">
  <img src="assets/banner.png" alt="Microsoft Rewards Bot Classic Banner" width="100%">
</div>

# Microsoft Rewards Bot Classic

Microsoft Rewards Bot Classic automates the old Microsoft Rewards dashboard for users who have not yet been moved to the newer Rewards interface.

Use the main Microsoft Rewards Bot V4 project when your account already has the new dashboard. Use this Classic project only for the old dashboard.

## Requirements

- Node.js 22 or newer
- npm
- A Microsoft Rewards account that still uses the old dashboard

## Quick Start

```bash
git clone https://github.com/QuestPilot/Microsoft-Rewards-Bot-Classic.git
cd Microsoft-Rewards-Bot-Classic
npm start
```

On the first run, the bot creates `src/config.jsonc` and `src/accounts.jsonc`. Add your accounts, then run `npm start` again.

## Commands

```bash
npm start              # Install missing runtime pieces, build, and run the bot
npm run dashboard      # Start the local monitoring dashboard
npm run dev            # Run from TypeScript sources
npm run build          # Compile TypeScript
npm run typecheck      # Check TypeScript without emitting files
npm test               # Run the test suite
npm run lint           # Run ESLint
npm run creator        # Experimental Microsoft account creator
npm run update         # Update from the Classic repository
```

## Features

- Daily set, more promotions, punch cards, quizzes, polls, and search activities for the old dashboard
- Desktop and mobile search automation
- Daily check-in and Read to Earn support where available
- Multi-account execution with optional clustering
- Local dashboard with live logs, account status, and run history
- Scheduler, Docker support, Discord-style webhooks, Stoat/Revolt webhooks, and ntfy notifications
- Config and account bootstrap with JSONC support

## Account Creator Warning

`npm run creator` is experimental. Newly created Microsoft accounts are commonly flagged when used for Rewards automation immediately. Let new accounts age for several weeks and use them manually before automation.

## Documentation

Start with [docs/index.md](docs/index.md). The most useful pages are:

- [Setup](docs/setup.md)
- [Configuration](docs/configuration.md)
- [Running](docs/running.md)
- [Dashboard](docs/dashboard.md)
- [Scheduling](docs/scheduling.md)
- [Notifications](docs/notifications.md)
- [Docker](docs/docker.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Update guide](docs/update.md)

## Repository

Primary source: [QuestPilot/Microsoft-Rewards-Bot-Classic](https://github.com/QuestPilot/Microsoft-Rewards-Bot-Classic)

## Disclaimer

Automation of Microsoft Rewards may violate Microsoft terms and can lead to account restrictions. Use this project at your own risk. This software is provided for educational purposes only.
