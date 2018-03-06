import constants from '../src/constants/shared'
// import { requestEventEmitter, responseEventEmitter } from '../__mocks__/http'
import EventEmitter from 'events'
import moment from 'moment'
import clk from 'chalk'

describe('downloads an mp3 file', () => {
  const retryInterval = moment.duration(
    constants.RETRY_INTERVAL_DOWNLOAD,
    'minutes'
  )
  const filename = '20180228'
  const mockConstants = {
    ...constants,
    BASE_URL: 'http://google.com/'
  }
  const fullUrl = mockConstants.BASE_URL + filename
  let consoleError
  let responseEventEmitter
  let requestEventEmitter
  beforeEach(() => {
    responseEventEmitter = new EventEmitter()
    requestEventEmitter = new EventEmitter()
    requestEventEmitter.statusCode = 200
    requestEventEmitter.pipe = jest.fn()
    consoleError = console.error
    console.error = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    console.error = consoleError
  })

  jest.doMock('http', () => ({
    get: (url, cb) => {
      cb(requestEventEmitter)
      return responseEventEmitter
    }
  }))

  jest.doMock('../src/constants/shared', () => mockConstants)
  const download = require('../src/lib/download').default

  describe('when it gets passed a url with a valid audio file', () => {
    beforeEach(() => {
      requestEventEmitter.headers = {
        'content-type': 'audio/mpeg',
        'content-length': 1
      }
    })

    it('returns a string with the filename path', async () => {
      const downloadPromise = download(filename)
      requestEventEmitter.emit('end')
      const data = await downloadPromise
      expect(data).toEqual(`tmp/${filename}`)
    })

    describe('when it receives an invalid domain name', () => {
      it('rejects when at 0 attempts remaining', async () => {
        await expect(download(filename, 0)).rejects.toThrowError(
          `Failed to download file from: ${fullUrl} after ${
            constants.MAX_ATTEMPTS
          } attempts.`
        )
      })
    })
  })

  describe('when there are errors', () => {
    const errorString = `Failed to download file from: ${fullUrl} after ${
      constants.MAX_ATTEMPTS
    } attempts.`

    it('rejects if the content type is not an audio', async () => {
      requestEventEmitter.headers = {
        'content-type': 'video/webm'
      }
      const downloadPromise = download(filename, 1)
      expect(console.error).toHaveBeenCalledTimes(1)
      expect(console.error.mock.calls[0].pop()).toMatchObject(
        new Error(
          clk.red(
            `No audio file found: ${clk.magenta(
              fullUrl
            )} \ntrying again in ${retryInterval.asMinutes()} minutes.`
          )
        )
      )
      jest.advanceTimersByTime(retryInterval.asMilliseconds())
      await expect(downloadPromise).rejects.toThrowError(errorString)
    })

    it('rejects if the content length is 0', async () => {
      requestEventEmitter.headers = {
        'content-length': 0
      }
      const downloadPromise = download(filename, 1)
      expect(console.error).toHaveBeenCalledTimes(1)
      expect(console.error.mock.calls[0].pop()).toMatchObject(
        new Error(
          clk.red(
            `No audio file found: ${clk.magenta(
              fullUrl
            )} \ntrying again in ${retryInterval.asMinutes()} minutes.`
          )
        )
      )
      jest.advanceTimersByTime(retryInterval.asMilliseconds())
      await expect(downloadPromise).rejects.toThrowError(errorString)
    })

    it('rejects after 3 tries', async () => {
      requestEventEmitter.headers = {
        'content-length': 0
      }
      const downloadPromise = download(filename)
      jest.advanceTimersByTime(retryInterval.asMilliseconds() * 3)
      expect(setTimeout).toHaveBeenCalledTimes(3)
      expect(console.error).toHaveBeenCalledTimes(3)
      setTimeout.mock.calls.forEach(callArgs => {
        expect(callArgs.pop()).toEqual(retryInterval.asMilliseconds())
      })
      await expect(downloadPromise).rejects.toThrowError(errorString)
    })
  })
})
