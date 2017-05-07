require('babel-register')

const downloader = require('../src/downloader').default

downloader(process.argv.slice(2).pop())
