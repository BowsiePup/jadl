# Just another Discord Library
*Formerly known as discord-rose, pronounced jay-dull*

Scale clean and hassle-free Discord bots with a simple library catered for advanced developers. Develop with ease and confidence now.

# Installation

Run `npm i --save jadl`

## Links

[Wiki](https://github.com/jpbberry/jadl/wiki) [Docs](https://jadl.js.org)

[Support Server](https://discord.gg/EdpA6qRHhs)

[NPM](https://npmjs.com/package/jadl), [GitHub](https://github.com/jpbberry/jadl)

# Simple bot

You can easily use the `SingleWorker` class for easy use of JADL, for scaled solution, look [below](#scaled-bot)

**./index.js**
```js
const { SingleWorker } = require('jadl')

const worker = new SingleWorker({
  token: 'BOT TOKEN'
})
```

# Scaled Bot

You can instead use a `Master` & `Worker` solution, one master managing multiple workers/clusters, which hold x amount of shards, making it much more efficient.

**./master.js**
```js
const { Master } = require('jadl')
const path = require('path')

const master = new Master(path.resolve(__dirname, './worker.js'), {
  token: 'BOT TOKEN'
})

master.start()
```

**./worker.js**
```js
const { Worker } = require('jadl')

const worker = new Worker()
```
Do `node ./master.js` and you're off to the races. Scaled automatically.

*Do note if your bot only ever fits into 1 cluster (< 5000 servers by default), you should consider using [SingleWorker](#simple-bot) since master & worker introduce more process overhead*

# Commands

Commands are offloaded to a separate library, you can of course just build your own with the given Discord events, but feel free to checkout [@jadl/cmd](https://npmjs.com/@jadl/cmd), a competent super-powered command handler built around decorators (TypeScript only) and slash commands only, made simple and easy to use.

## Ready to take it to the next level? Take a look out our [Wiki](https://github.com/jpbberry/jadl/wiki)
