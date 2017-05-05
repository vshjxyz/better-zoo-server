
resource "aws_s3_bucket" "better-zoo" {
  bucket = "better-zoo"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Allows delete and put object to the user single_user",
            "Effect": "Allow",
            "Principal": {
                "AWS": "${aws_iam_user.single_user.arn}"
            },
            "Action": [
                "s3:DeleteObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::better-zoo",
                "arn:aws:s3:::better-zoo/*"
            ]
        },
        {
            "Sid": "Allows read access to mp3s to everyone",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::better-zoo/*.mp3"
            ]
        }
    ]
}
EOF
}