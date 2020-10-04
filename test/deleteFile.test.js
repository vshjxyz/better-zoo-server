import fs from 'fs'

let deleteFile

describe('deletes a file from filesystem', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'unlink')
    deleteFile = require('../src/lib/deleteFile').default
  })

  it('resolves if file exists and no errors were thrown', async () => {
    const path = 'return value from deleteFile is ciao'
    fs.unlink.mockImplementationOnce((path, callback) => callback())
    await deleteFile(path)
    expect(fs.unlink).toHaveBeenCalled()
    expect(fs.unlink.mock.calls[0][0]).toEqual(path)
  })

  it('rejects if there is an error during unlink', async () => {
    const path = 'return value from deleteFile is ciao'
    const error = new Error('error')
    fs.unlink.mockImplementationOnce((path, callback) => callback(error))
    await expect(deleteFile(path)).rejects.toThrowErrorMatchingSnapshot()
  })

  it('resolves if there is an ENOENT error', async () => {
    const path = 'return value from deleteFile is ciao'
    const error = new Error('error')
    error.code = 'ENOENT'
    fs.unlink.mockImplementationOnce((path, callback) => callback(error))
    await deleteFile(path)
    expect(fs.unlink).toHaveBeenCalled()
  })
})
