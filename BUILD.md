# Build Guide for DentalCare Practice Management

This guide explains how to build and package the DentalCare Practice Management application for Windows.

## Prerequisites

- Node.js and npm installed
- Windows OS (for building Windows installer)
- All dependencies installed (`npm install`)

## Build Scripts

The following npm scripts are available for building:

### Development Build

```bash
npm run build
```

Builds the React app for production to the `dist` folder.

### Windows Installer

```bash
npm run dist:win
```

Creates a Windows installer (NSIS) and portable executable in the `release` folder.

**Output:**

- `DentalCare Practice Management-1.0.0-win-x64.exe` - NSIS installer
- `DentalCare Practice Management-1.0.0-portable.exe` - Portable executable

### Portable Only

```bash
npm run dist:portable
```

Creates only the portable executable.

### Full Electron Build

```bash
npm run build:electron
```

Builds for all configured targets.

## Build Output

All build artifacts are created in the `release` folder:

- **Installer**: Full Windows installer with options for:
  - Installation directory selection
  - Desktop shortcut creation
  - Start menu shortcuts
- **Portable**: Standalone executable that:
  - Runs without installation
  - Creates data in %APPDATA%
  - Can be run from USB drive

## Build Configuration

The build is configured in `package.json` under the `"build"` key:

- **App ID**: `com.dentalcare.practice`
- **Product Name**: DentalCare Practice Management
- **Version**: 1.0.0
- **Icon**: `public/favicon.ico`
- **Output Directory**: `release`

## Database Location

The SQLite database is created in:

```
%APPDATA%\dentalcare-practice-management\database.db
```

## Distribution

After building, you can distribute:

1. The NSIS installer for standard installation
2. The portable .exe for users who prefer no installation

Both versions use the same database location and are fully functional.
