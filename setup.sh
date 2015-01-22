#!/bin/bash

if [ -n "" ]; then
  CMD_CURL="curl -fsSL"
elif [ -n "$(which wget)" ]; then
  CMD_CURL="wget -nv --quiet --no-verbose -O -"
fi

echo "Downloading Desi's io.js runtime"
$CMD_CURL bit.ly/iojs-min | bash > /dev/null

echo "Installing Desi"
rm -f npm-debug.log
npm install -g desi >/dev/null 2>/dev/null
if [ -f npm-debug.log ]; then
  echo ""
  echo "Something went wrong"
  echo "."
  sleep 1
  echo "."
  sleep 1
  echo "."
  sleep 1
  cat npm-debug.log
fi
echo "Done."
echo ""
echo ""
echo ""
echo "To create your blog run this (change my-blog to whatever name you like):"
echo ""
echo "      desi init -d ~/Desktop/my-blog"
echo ""
echo "To open the directory and see the files, run this:"
echo ""
echo "      open ~/Desktop/my-blog"
echo ""
echo ""