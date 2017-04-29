#!/bin/bash
terraform get
terraform plan -out=./state/terraform.tfplan
