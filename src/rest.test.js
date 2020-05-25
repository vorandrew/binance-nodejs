import 'dotenv/config'
import Debug from 'debug'
import Rest from './rest'

// eslint-disable-next-line no-unused-vars
const debug = Debug('binance:api:rest:test')
const rest = new Rest()

describe('rest', () => {
  it('exchangeInfo', async () => {
    const info = await rest.exchangeInfo()
    debug(info)
    expect(info).toHaveProperty('serverTime')
  })

  it('account', async () => {
    const account = await rest.account()
    debug(account)
    expect(account).toHaveProperty('balances')
  })

  it('ticker', async () => {
    let ticker = await rest.ticker_price({ symbol: 'HBARUSDT' })
    expect(ticker).toHaveProperty('price')
  })

  it('order', async () => {
    let res = await rest.order(
      {
        symbol: 'HBARUSDT',
        side: 'SELL',
        type: 'MARKET',
        quantity: 300,
      },
      'POST'
    )
    expect(res).toHaveProperty('status')
  })
})
