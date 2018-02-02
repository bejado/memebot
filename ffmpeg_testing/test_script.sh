#!/usr/bin/env bash
# $1- result name
# $2- youtube video link

function cleanup {
    echo "Cleaning up..."
    exit 1
}

function logError {
    echo "[ERROR] $1"
}

function logInfo {
    echo "[INFO ] $1"
}

function errorAndCleanup {
    logError "$1"
    cleanup
}

# Check that our dependencies are installed
logInfo "Checking that ffmpeg is installed"
ffmpeg -version >/dev/null || errorAndCleanup "ffmpeg not installed"
logInfo "Checking that youtube-dl is installed"
youtube-dl --version >/dev/null 2>&1 || errorAndCleanup "youtube-dl not installed"

# Do our work in the generated directory
pushd generated
youtube-dl -f mp4 -o "$1.mp4" "$2"
popd

