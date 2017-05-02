#!/bin/bash
export HEROKU_API_KEY=$(heroku auth:token)
terraform --version
terraform get
terraform apply -state-out=./state/terraform.tfstate ./state/terraform.tfplan
