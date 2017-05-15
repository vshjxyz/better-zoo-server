better-zoo-server
===

This little experimental project aims to hit a URL with one or more public MP3 files, downloads it, compresses it using [Sox](http://sox.sourceforge.net/) and uploads it to an S3 bucket

Setup
---
Install Sox with lame bindings (on mac `brew install sox --with-lame`) to deal with MP3s.

```bash
cd better-zoo-server
nvm install && nvm use # You can skip this if you're already using node v7.7.+
npm i -g yarn
yarn
```

Run
---

```bash
yarn start          # This will rip the MP3 based on the current day
yarn start 20170512 # This will rip the MP3 for a specific day
```

You should see:
![better-zoo download](https://cloud.githubusercontent.com/assets/958803/26038895/af2d814a-3912-11e7-896a-7588c59bfab2.gif)



Deploy
---
The project uses [terraform](https://www.terraform.io/) to create an s3 bucket and link it to a free heroku node

I've written a couple of scripts to deal with terraform state plan & apply (it requires heroku toolbelt to be installed with the current user logged in).

You can try to use them on your own but you will need aws credentials available as env variables or you can create a `~/.aws/credentials` file with something similar to:

```
aws_access_key_id = <your access key>
aws_secret_access_key = <your secret>
aws_default_region = eu-west-1
```

Then when from the `terraform` folder you can use `./scripts/terraform_plan.sh` to create a precise updating plan and `./scripts/terraform_apply.sh` to apply it.
