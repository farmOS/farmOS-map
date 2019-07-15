#!/bin/bash
# Run npm run dev in Docker.
sudo docker run -it --rm \
  -v ${PWD}:/usr/src/app \
  -w /usr/src/app \
  -u $UID \
  -p 8080:8080 \
  node npm run dev
