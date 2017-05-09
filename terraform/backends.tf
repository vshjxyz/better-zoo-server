terraform {
  backend "s3" {
    bucket = "better-zoo-state"
    key    = "terraform.tfstate"
    region = "eu-west-1"
  }
}
