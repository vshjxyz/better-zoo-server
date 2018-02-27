import download from '../src/lib/download'
import { filename } from '../src/downloader'

it('rejects when at 0 attempts remaining', () => {
  expect(download(filename, 0)).rejects.toThrow()
})
