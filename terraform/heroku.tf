resource "heroku_app" "default" {
  name   = "better-zoo-server"
  region = "eu"

  config_vars {
    AWS_ACCESS_KEY_ID = "${aws_iam_access_key.user_access_key.id}"
    AWS_SECRET_ACCESS_KEY = "${aws_iam_access_key.user_access_key.secret}"
    BASE_URL = "http://www.105.net/upload/uploadedContent/repliche/zoo/"
  }

  buildpacks = [
    "heroku/nodejs",
    "https://github.com/heroku/heroku-buildpack-apt",
    "https://github.com/vshjxyz/heroku-buildpack-linuxbrew"
  ]
}
