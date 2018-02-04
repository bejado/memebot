#!/usr/bin/env bash

# Take the audio and video from short_video.mp4,
# mix it with the audio of audio_input.mp4 (seeking 1 minute into the video and fading in at 2 seconds)
# and output to out.mp4
ffmpeg -y \
    -i short_video.mp4 \
    -ss 00:01:00 -i audio_input.mp4 \
    -filter_complex \
    "[1:a]afade=t=in:st=2:d=2[audio];
     [0:a][audio]amix=inputs=2[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -shortest -q:a 4 out.mp4

