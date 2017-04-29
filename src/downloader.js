import fs from 'fs'
import constants from './constants/shared'
import path from 'path'
import http from 'http'
import sox from 'sox'
import clk from 'chalk'
import moment from 'moment'
import progress from 'cli-progress'

const download = (filename) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(constants.DOWNLOAD_DIR)) {
      fs.mkdirSync(constants.DOWNLOAD_DIR)
    }

    const fullpath = path.join(constants.DOWNLOAD_DIR, filename)
    const fullUrl = constants.BASE_URL + filename
    const file = fs.createWriteStream(fullpath)
    const UI = new progress.Bar({
      stream: process.stdout
    }, progress.Presets.rect)

    http.get(
      fullUrl,
      (response) => {
        let cur = 0
        const total = parseInt(response.headers['content-length'], 10)
        const totalInMB = (total / (1024 * 1024)).toFixed(2)

        console.log(clk.gray(`Downloading ${clk.magenta(fullUrl)}`))

        UI.start(totalInMB, 0)

        response.on('data', (chunk) => {
          cur += chunk.length
          const curInMB = (cur / (1024 * 1024)).toFixed(2)
          UI.update(curInMB)
        })

        response.on('error', reject)
        response.on('end', () => {
          UI.stop()
          resolve()
        })

        response.pipe(file)
      }
    )
  })
}

const convertToOgg = (filename) => {
  return new Promise((resolve, reject) => {
    const inputFile = path.join(constants.DOWNLOAD_DIR, filename)
    const outputFile = path.join(constants.DOWNLOAD_DIR, filename.replace('.mp3', '.ogg'))
    const UI = new progress.Bar({
      stream: process.stdout
    }, progress.Presets.rect)

    const job = sox.transcode(
      inputFile,
      outputFile,
      {
        sampleRate: 44100,
        format: 'ogg',
        channelCount: 2,
        bitRate: 96 * 1024,
        compressionQuality: 2 // see `man soxformat` search for '-C' for more info
      })

    job.on('error', err => {
      console.error(err)
    })
    job.on('progress', (amountDone, amountTotal) => {
      if (!UI.startTime) {
        console.log(clk.gray(`Converting ${clk.magenta(inputFile)} to ogg`))
        UI.start(100, 0)
      }

      UI.update(((amountDone / amountTotal) * 100).toFixed(2))
    })

    job.on('end', () => {
      UI.stop()
      resolve()
    })

    job.start()
  })
}

export default () => {
  moment.locale('it')
  const day = moment().subtract(2, 'day')
  const filename = `${moment(day).format('ddd_DDMMYYYY')}_ZOO${constants.EXTENSION}`
  // download(filename)
  convertToOgg(filename)
}
