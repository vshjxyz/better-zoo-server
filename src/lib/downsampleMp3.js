import progress from 'cli-progress'
import clk from 'chalk'
import sox from 'sox'

export default (inputFile) => {
  return new Promise((resolve, reject) => {
    const outputFile = inputFile.replace('.mp3', '2.mp3')
    const UI = new progress.Bar({
      stream: process.stdout
    }, progress.Presets.rect)

    const job = sox.transcode(
      inputFile,
      outputFile,
      {
        sampleRate: 44100,
        format: 'mp3',
        channelCount: 2,
        bitRate: 96 * 1024,
        compressionQuality: 3 - 96 // see `man soxformat` search for '-C' for more info
      })

    job.on('error', reject)

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
