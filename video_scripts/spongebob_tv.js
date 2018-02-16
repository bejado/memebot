#!/usr/bin/env node

const ffmpeg = require('fluent-ffmpeg');

if (process.argv.length < 4) {
  console.error(`Usage: ${process.argv[1]} <source video> <output> [<source offset seconds>]`);
  process.exit(1);
}

const sourceVideoPath = process.argv[2];
const outputVideoPath = process.argv[3];
const offsetSeconds = parseInt(process.argv[4], 10) || 0;

const normalizeVideo = (input, output) => {
  return `[${input}]scale=480:360:force_original_aspect_ratio=decrease,setsar=1,pad=480:360:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS[${output}]`;
}

let command = ffmpeg()
  .addInput(sourceVideoPath).seekInput(offsetSeconds).inputOptions('-t 5')
  .addInput('../video_sources/SpongebobTV/television_matte.png')
  .addInput('../video_sources/SpongebobTV/intro.mp4')
  .addInput('../video_sources/SpongebobTV/outro.mp4')
  .addInput('../video_sources/SpongebobTV/mask.png').loop()
  .videoCodec('libx264')
  .complexFilter([
    normalizeVideo('0:v', 'v0'),   // input video
    "[4:v]alphaextract[a]",
    "[v0][a]alphamerge[final]",
    "[1:v][final]overlay[finalfinal]",
    {
      filter: 'concat',
      inputs: ['2:v', '2:a',
              'finalfinal', '0:a',
              '3:v', '3:a'],
      options: {
        n: 3,   // input segments
        v: 1,   // output video streams
        a: 1,   // output audio streams
      },
      outputs: 'combined'
    }
  ], ['combined'])
  .outputOptions(['-movflags', '+faststart', '-shortest'])
  .output(outputVideoPath)
  .on('start', commandLine => {
    console.log(commandLine);
  })
  .run();

