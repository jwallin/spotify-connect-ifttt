#!/bin/bash

sed -n 's/exports\.\([a-zA-Z]*\).*/\1/p' index.js | xargs -I {} gcloud functions deploy {} --trigger-http --runtime nodejs10
