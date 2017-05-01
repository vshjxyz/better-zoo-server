#!/bin/bash
terraform get
terraform plan -state=./state/terraform.tfstate -out=./state/terraform.tfplan
