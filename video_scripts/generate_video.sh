#!/usr/bin/env bash
# $1- result name
# $2- youtube video link
# $3- youtube link start time

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

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
if [[ ! -d generated ]]; then
    mkdir generated
fi
pushd generated/

# Download the YouTube video
youtubeOutput="${1}-source.mp4"
youtube-dl -f mp4 -o "$youtubeOutput" "$2"

# Generate the video
${DIR}/holey_moley.js \
    "${youtubeOutput}" \
    "${1}.mp4" \
    ${3:0}

popd

