#!/bin/bash
# Run npm install in Docker.
sudo docker run -it --rm \
  -v ${PWD}:/usr/src/app \
  -w /usr/src/app \
  -u $UID \
  node npm install
