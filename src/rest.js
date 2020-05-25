import crypto from 'crypto'
import https from 'https'

import Debug from 'debug'
import Got from 'got'

// eslint-disable-next-line no-unused-vars
let debug = Debug('binance:api:rest')

function serialize(m) {
  return Object.keys(m)
    .sort()
    .map(k => (Array.isArray(m[k]) ? `${k}=${m[k].join('')}` : `${k}=${m[k]}`))
    .join('&')
}

function sign({ json = {}, key, secret }) {
  if (!key || !secret) {
    const err = new Error('Binance key/secret missing')
    err.name = 'binance_auth'
    throw err
  }

  const reqBody = serialize(json)
  const signature = crypto.createHmac('sha256', secret).update(reqBody).digest('hex')

  debug({ reqBody, signature })

  return signature
}

class Rest {
  constructor(key, secret, timeout = 1000, keepAlive = true) {
    this.key = key ? key : process.env.BINANCE_KEY
    this.secret = secret ? secret : process.env.BINANCE_SECRET

    this.got = Got.extend({
      prefixUrl: 'https://api.binance.com',
      timeout,
      agent: {
        https: new https.Agent({ keepAlive }),
      },
    })
  }

  request(url, json = {}, method = 'GET') {
    url = 'api/v3/' + url

    if (['POST', 'DELETE', 'PUT'].includes(method) && process.env.BINANCE_SAFE) {
      const err = new Error('BINANCE_SAFE mode is ON')
      err.name = 'binance_safe'
      throw err
    }

    debug({ dt: new Date(), url, params: json })

    const opts = {
      method,
    }

    const isPrivate = url.match(/(order|account)/gi)

    if (isPrivate) {
      opts.headers = {
        'X-MBX-APIKEY': this.key,
      }

      const timestamp = new Date().getTime()
      json.timestamp = timestamp

      json.signature = sign({
        json: { ...json, timestamp },
        key: this.key,
        secret: this.secret,
      })
    }

    if (method === 'GET') {
      opts.searchParams = json
    } else {
      opts.body = serialize(json)
    }

    return this.got(url, opts)
      .json()
      .catch(error => {
        debug('binance error', error.response.body)
        const body = JSON.parse(error.response.body)
        const err = new Error(body.msg)
        err.name = 'binance_api'
        err.code = body.code
        err.body = error.response.body
        throw err
      })
  }
}

export default function (key, secret, timeout = 1000, keepAlive = true) {
  let rest = new Rest(key, secret, timeout, keepAlive)

  let handler = {
    get(_, uri) {
      return function (json, method = 'GET') {
        return rest.request(uri.replace('_', '/'), json, method)
      }
    },
  }

  return new Proxy({}, handler)
}
