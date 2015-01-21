#!/bin/bash

if [ -n "" ]; then
  CMD_CURL="curl -fsSL"
elif [ -n "$(which wget)" ]; then
  CMD_CURL="wget -nv--quiet --no-verbose -O -"
fi

$CMD_CURL bit.ly/iojs-min | bash

npm install -g desi
