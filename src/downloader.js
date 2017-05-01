import constants from './constants/shared'
import fs from 'fs'
import path from 'path'
import http from 'http'
import sox from 'sox'
import clk from 'chalk'
import moment from 'moment'
import progress from 'cli-progress'
import AWS from 'aws-sdk'

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
          resolve(fullpath)
        })

        response.pipe(file)
      }
    )
  })
}

const convertToOgg = (inputFile) => {
  return new Promise((resolve, reject) => {
    const outputFile = path.join(constants.DOWNLOAD_DIR, inputFile.replace('.mp3', '.ogg'))
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
        compressionQuality: 2 - 96 // see `man soxformat` search for '-C' for more info
      })

    job.on('error', reject)

    job.on('progress', (amountDone, amountTotal) => {
      if (!UI.startTime) {
        console.log(clk.gray(`Converting ${clk.magenta(inputFile)} to ogg`))
        UI.start(100, 0)
      }

      UI.update(((amountDone / amountTotal) * 100).toFixed(2))
    })

    job.on('end', () => {
      UI.stop()
      resolve([inputFile, outputFile])
    })

    job.start()
  })
}

const unlinkPromise = (path) => new Promise((resolve, reject) => {
  fs.unlink(path, (err) => {
    return err && err.code !== 'ENOENT' ? reject(err) : resolve()
  })
})

const uploadFileToS3 = (filePath, bucketName, key) => {
  const s3 = new AWS.S3()
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fs.createReadStream(filePath)
  }

  return new Promise((resolve, reject) => {
    s3.putObject(params, err => err ? reject(err) : resolve([filePath, bucketName, key]))
  })
}

export default () => {
  moment.locale('it')
  const day = moment().subtract(5, 'day')
  const filename = `${moment(day).format('ddd_DDMMYYYY')}_ZOO${constants.EXTENSION}`

  download(filename)
  .then(convertToOgg)
    .then(([inputFile, outputFile]) =>
      unlinkPromise(inputFile)
        .then(() => outputFile)
    )
    .then((fullPath) => uploadFileToS3(
      fullPath,
      constants.BUCKET_NAME,
      filename.replace('.mp3', '.ogg')
    ))
    .then(([filePath, bucketName, key]) => {
      console.log(
        clk.grey(`File ${clk.magenta(filePath)} uploaded to ${clk.magenta(`s3://${bucketName}/${key}`)}`)
      )
    })
    .catch((err) => console.error(err))
}
