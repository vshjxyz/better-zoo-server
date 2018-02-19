import progress from 'cli-progress'
import clk from 'chalk'
import sox from 'sox'
import constants from '../constants/shared'

export default function compressAudio (inputFile, attempts = constants.MAX_ATTEMPTS) {
  return new Promise((resolve, reject) => {
    const outputFile = inputFile.replace('.mp3', '2.mp3')
    const UI = new progress.Bar({
      stream: process.stdout
    }, progress.Presets.rect)

    if (attempts === 0) {
      return reject(new Error(clk.red(`Failed to convert file: ${inputFile} after ${constants.MAX_ATTEMPTS} attempts.`)))
    }

    const job = sox.transcode(
      inputFile,
      outputFile,
      {
        sampleRate: 44100,
        format: 'mp3',
        channelCount: 2,
        bitRate: 130.2 * 1024,
        compressionQuality: 5 - 96 // see `man soxformat` search for '-C' for more info
      })

    job.on('error', () => {
      reject(new Error(clk.red(`Failed to convert file: ${inputFile} \n retrying...`)))
      return setTimeout(() => (
        compressAudio(inputFile, attempts - 1)
        .catch(err => console.log(err))
      ), 2000)
    })

    job.on('progress', (amountDone, amountTotal) => {
      if (!UI.startTime) {
        console.log(clk.gray(`Compressing ${clk.magenta(inputFile)}...`))
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
