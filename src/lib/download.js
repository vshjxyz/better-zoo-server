import constants from '../constants/shared'
import progress from 'cli-progress'
import fs from 'fs'
import path from 'path'
import http from 'http'
import clk from 'chalk'

export default function download (filename, attempts) {
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

    if (attempts === 0) {
      reject(new Error(clk.red(`Unable to download ${fullUrl}`)))
      return
    }

    http.get(
      fullUrl,
      (response) => {
        let cur = 0
        const responseType = response.headers['content-type']
        if (!responseType.includes('audio')) {
          console.log((clk.red(`No audio file found: ${clk.magenta(fullUrl)} \ntrying again in ${constants.RETRY_INTERVAL / 60} minutes.`)))
          return setTimeout(() => download(filename, attempts - 1), constants.RETRY_INTERVAL)
        }
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
          resolve(fullpath)
        })

        response.pipe(file)
      }
    )
  })
}
