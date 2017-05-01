import fs from 'fs'

export default (path) => new Promise((resolve, reject) => {
  fs.unlink(path, (err) => {
    return err && err.code !== 'ENOENT' ? reject(err) : resolve(path)
  })
})
