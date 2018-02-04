#!/usr/bin/env bash
# $1- video 1
# $2- video 1 seek
# $3- video 1 length
# $4- video 2
# $5- video 2 seek
# $6- video 2 length
# $7- out

ffmpeg -y \
    -ss $2 -t $3 -i "$1" \
    -ss $5 -t $6 -i "$4" \
    -filter_complex \
     "[0:v]scale=640:480:force_original_aspect_ratio=decrease,setsar=1,pad=640:480:(ow-iw)/2:(oh-ih)/2[v0]; \
      [1:v]scale=640:480:force_original_aspect_ratio=decrease,setsar=1,pad=640:480:(ow-iw)/2:(oh-ih)/2[v1]; \
      [v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]" \
      -map "[v]" -map "[a]" -c:v libx264 -c:a aac -movflags +faststart "$7"

