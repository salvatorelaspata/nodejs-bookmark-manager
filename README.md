# Bookmark manager

Node js script to export json file contains all Chrome profile bookmark data (Default & Profile 1-n)

This solution read filesystem to retrieve profile in the following path:

- macos: `/Users/<user>/Library/Application Support/Google/Chrome/*`
- win: `C:\Users\<user>\AppData\Local\Google\Chrome\User Data\*`
- linux: `Coming soon`

## Prerequisites

Chrome installed and all profile are sync

# Basic getting started

1. clone this repo & navigate to the repo
2. `npm install`
3. `npm start`

at the end the output file will be downloaded in the root directory

# Cli interfaces

- clone this repo & navigate to new directory
- install dependencies `npm install`
- link cli `npm link`
- exec `bookmark-manager` from terminal

## Coming soon

implement args to automatize wizard

### Enjoy
