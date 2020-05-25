# binance-nodejs
Binance.com v3 NodeJS REST API


# Install

```bash
yarn add binance-nodejs
```

# Setup

ENV vars (used if no params provided to constructor)

```bash
BINANCE_SAFE=1              // Read-only mode
BINANCE_TESTNET=1           // Testnet
BINANCE_KEY=key_here        // API Key
BINANCE_SECRET=secret_here  // API Secret
```

Import

```js
import { REST } from 'binance-nodejs'
```

# REST

Constructor

```js
const rest = new REST(key, secret, testnet = false, timeout = 500, keepAlive = true)
```

Documentation https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md

```js
const info = await rest.exchangeInfo()
```

GET /api/v3/ticker/price

```js
rest.ticker_price({ symbol: 'BTCUSDT' })
```

POST /api/v3/order

```js
const res = await rest.order(
    {
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'MARKET',
      quantity: .1,
    },
    'POST'
  )
```
