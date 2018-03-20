#!/bin/bash

sed -n 's/exports\.\([a-zA-Z]*\).*/\1/p' index.js | xargs -I {} gcloud beta functions deploy {} --trigger-http
