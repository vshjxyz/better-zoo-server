
resource "aws_s3_bucket" "better-zoo" {
  bucket = "better-zoo"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Allow read and write access to bucket for specific user roles",
            "Effect": "Allow",
            "Principal": {
                "AWS": "${aws_iam_user.single_user.arn}"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::better-zoo",
                "arn:aws:s3:::better-zoo/*"
            ]
        }
    ]
}
EOF
}