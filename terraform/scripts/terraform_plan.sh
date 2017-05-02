#!/bin/bash
export HEROKU_API_KEY=$(heroku auth:token)
terraform get
terraform plan -state=./state/terraform.tfstate -out=./state/terraform.tfplan
