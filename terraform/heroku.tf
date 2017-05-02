resource "heroku_app" "default" {
  name   = "better-zoo-server"
  region = "eu"

  config_vars {
    AWS_ACCESS_KEY_ID = "${aws_iam_access_key.user_access_key.id}"
    AWS_SECRET_ACCESS_KEY = "${aws_iam_access_key.user_access_key.secret}"
  }

  buildpacks = [
    "heroku/nodejs",
    "https://github.com/sunny4381/heroku-buildpack-linuxbrew"
  ]
}
