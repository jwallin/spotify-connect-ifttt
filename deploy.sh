#!/bin/bash

gcloud beta functions deploy playOnDevice --trigger-http

gcloud beta functions deploy skipNext --trigger-http
