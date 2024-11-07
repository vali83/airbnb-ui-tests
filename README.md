# Airbnb UI Automated Tests

This project contains automated UI tests for Airbnb's search functionality using WebdriverIO and TypeScript.

bash
`git clone <repository-url>`
`cd webdriverIO`

`npm install`

bash
`npm test`

├── test/
│ ├── pageobjects/ # Page Object Models
│ ├── specs/ # Test specifications
│ ├── models/ # Data models
│ └── utils/ # Utility functions
├── wdio.conf.ts # WebdriverIO configuration
├── tsconfig.json # TypeScript configuration
└── package.json # Project dependencies

## Setup

1. Clone the repository:
2. Install dependencies: `npm install`
3. Run the tests: `clear; npx wdio run wdio.conf.ts --spec test-1.e2e.ts`
4. 