import AWS from 'aws-sdk'
import fs from 'fs'

export default (filePath, bucketName, key) => {
  const s3 = new AWS.S3()
  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: `audio/mp3`,
    Body: fs.createReadStream(filePath)
  }

  return new Promise((resolve, reject) => {
    s3.putObject(params, err => err ? reject(err) : resolve([filePath, bucketName, key]))
  })
}
