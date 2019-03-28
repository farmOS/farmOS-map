#!/bin/bash

# Touch build/farmOS-map.js to ensure that it is owned by this user.
touch build/farmOS-map.js

# Build the farmos-map Docker image.
sudo docker build -t farmos-map .

# Build farmOS-map.js with NPM.
sudo docker run -it --rm -v "$PWD/build":/usr/src/app/build farmos-map npm run build
