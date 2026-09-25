
# MyBank

A modern personal banking dashboard built with vanilla HTML, CSS, and JavaScript, replicating the core experience of a typical mobile banking platform, including account management, transfers, bill payments, and spending insights, all running entirely in the browser with no backend required.

## Features

- User login and registration
- Dashboard with real-time account balance (with show/hide toggle)
- Account number and bank details display
- Send money to saved or new beneficiaries
- Receive money with copyable account details
- Transfer and transaction history
- Transaction search and filtering by type and status
- Airtime purchase across major networks
- Bill payments (electricity, water, internet, cable TV)
- Debit and credit transaction cards
- Spending summary chart (drawn on canvas, no chart library)
- Profile settings
- Dark and light mode
- In-app notifications

## Built with

- HTML5
- CSS3 (no frameworks, no preprocessors, single external stylesheet)
- Vanilla JavaScript (no frameworks or build tools)
- Browser localStorage for data persistence

## Design

The interface uses a dark navy palette with amber and teal accents, notched card panels, and monospace and grotesque typeface pairings for an instrument panel feel. No gradients, no emoji, no external UI libraries.

## Getting started

Clone the repository and open `index.html` in a browser. No build step, no dependencies, no server required.

```bash
git clone https://github.com/PetalhazDev/mybank.git
cd mybank
open index.html
```

Demo login:
```
Email: ada@example.com
Password: password123
```
Or register a new account from the sign up tab.

## Project structure


mybank/
├── index.html          # Login and registration
├── dashboard.html       # Account overview
├── send.html            # Send money
├── receive.html         # Receive money
├── transactions.html    # Transaction history
├── airtime.html          # Airtime purchase
├── bills.html            # Bill payments
├── profile.html          # Profile settings
├── css/
│   └── style.css
└── js/
    ├── store.js          # Shared state and localStorage layer
    ├── auth.js
    ├── dashboard.js
    ├── send.js
    ├── receive.js
    ├── transactions.js
    ├── airtime.js
    ├── bills.js
    └── profile.js


## Author

Babatunde Peter
GitHub: [@PetalhazDev](https://github.com/PetalhazDev)

## License

MIT
```

Swap in your actual live Vercel link under a "Live demo" line near the top if you want one, and adjust the license section if you're using something other than MIT.
