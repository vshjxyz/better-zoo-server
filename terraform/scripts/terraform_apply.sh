#!/bin/bash
terraform --version
terraform get
terraform apply -state-out=./state/terraform.tfstate ./state/terraform.tfplan
