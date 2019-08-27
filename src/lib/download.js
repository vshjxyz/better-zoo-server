import constants from '../constants/shared'
import progress from 'cli-progress'
import fs from 'fs'
import path from 'path'
import { http, https } from 'follow-redirects'
import clk from 'chalk'
import moment from 'moment'

export default function download(filename, attempts = constants.MAX_ATTEMPTS) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(constants.DOWNLOAD_DIR)) {
      fs.mkdirSync(constants.DOWNLOAD_DIR)
    }

    const retryInterval = moment.duration(
      constants.RETRY_INTERVAL_DOWNLOAD,
      'minutes'
    )
    const fullpath = path.join(constants.DOWNLOAD_DIR, filename)
    const fullUrl = constants.BASE_URL + filename

    if (attempts === 0) {
      return reject(
        new Error(
          clk.red(
            `Failed to download file from: ${fullUrl} after ${
              constants.MAX_ATTEMPTS
            } attempts.`
          )
        )
      )
    }

    const file = fs.createWriteStream(fullpath)
    const UI = new progress.Bar(
      {
        stream: process.stdout
      },
      progress.Presets.rect
    )

    const errorHandler = e => reject(new Error(e))

    const isHttps = fullUrl.includes('https://')

    const request = (isHttps ? https : http).get(fullUrl, response => {
      let cur = 0
      const responseType = response.headers['content-type']
      const total = parseInt(response.headers['content-length'], 10)
      const totalInMB = (total / (1024 * 1024)).toFixed(2)
      if (
        response.statusCode !== 200 ||
        !total ||
        !responseType.includes('audio')
      ) {
        console.error(
          new Error(
            clk.red(
              `No audio file found: ${clk.magenta(
                fullUrl
              )} \ntrying again in ${retryInterval.asMinutes()} minutes.`
            )
          )
        )
        return setTimeout(
          () => resolve(download(filename, attempts - 1)),
          retryInterval.asMilliseconds()
        )
      }

      console.log(clk.gray(`Downloading ${clk.magenta(fullUrl)}`))

      UI.start(totalInMB, 0)

      response.on('data', chunk => {
        cur += chunk.length
        const curInMB = (cur / (1024 * 1024)).toFixed(2)
        UI.update(curInMB)
      })

      response.on('error', errorHandler)
      response.on('end', () => {
        UI.stop()
        resolve(fullpath)
      })

      response.pipe(file)
    })
    request.on('error', errorHandler)
  })
}
