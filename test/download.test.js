import download from '../src/lib/download.js'
import { filename } from '../src/downloader.js'

test('rejects when at 0 attempts remaining', () => {
  expect(download(filename, 0)).rejects.toThrow()
})
