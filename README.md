# Bookmark manager

Node js script to export json file contains all Chrome profile bookmark data (Default & Profile 1-n)

This solution read filesystem to retrieve profile in the following path:

- macos: `/Users/<user>/Library/Application Support/Google/Chrome/*`
- win: `C:\Users\<user>\AppData\Local\Google\Chrome\User Data\*`
- linux: `Coming soon`

## Prerequisites

Chrome installed and all profile are sync

## Getting started

1. clone this repo
2. `node index.js`

at the end the output file will be downloaded in the root directory

### Enjoy
