import constants from '../constants/shared'
import progress from 'cli-progress'
import fs from 'fs'
import path from 'path'
import http from 'http'
import clk from 'chalk'

export default (filename) => {
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
          resolve(fullpath)
        })

        response.pipe(file)
      }
    )
  })
}
