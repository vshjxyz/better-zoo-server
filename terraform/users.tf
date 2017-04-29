resource "aws_iam_user" "single_user" {
  name = "better-zoo-user"
}

resource "aws_iam_access_key" "user_access_key" {
  user = "${aws_iam_user.single_user.name}"
}
