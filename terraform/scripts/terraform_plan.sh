#!/bin/bash
export HEROKU_API_KEY=$(heroku auth:token)
terraform get
terraform plan -out=./terraform.tfplan
