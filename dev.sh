#!/bin/bash

# Touch build/index.html and build/farmOS-map.js to ensure that it is owned by
# this user.
touch build/index.html
touch build/farmOS-map.js

# Build the farmos-map Docker image.
sudo docker build -t farmos-map .

# Build farmOS-map.js with NPM.
sudo docker run -it --rm -p 80:8080 -v "$PWD":/usr/src/app farmos-map npm run dev
