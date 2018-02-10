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
  return `[${input}]scale=640:480:force_original_aspect_ratio=decrease,setsar=1,pad=640:480:(ow-iw)/2:(oh-ih)/2[${output}]`;
}

// Here we're assuming the input video has a length of at least 5
let command = ffmpeg()
  .addInput('../video_sources/holey_moley.mp4')
  .addInput(sourceVideoPath).seekInput(offsetSeconds)
  .videoCodec('libx264')
  .audioCodec('aac')
  .complexFilter([
    // The input videos will most likely have different sizes and SARs, so first scale them to a consistent size
    normalizeVideo('0:v', 'v0'),   // holey_moley
    normalizeVideo('1:v', 'v1'),  // TV screen video intro
    // Trim the TV screen video intro
    {
      inputs: 'v1',
      filter: 'trim',
      options: {
        start: 0,
        end: 5
      },
      outputs: 'tv-trimmed'
    },
    // Scale the TV screen video down
    {
      inputs: ['1:v'],
      filter: 'scale',
      options: {
        w: '80*a',
        h: '80'
      },
      outputs: 'tv-scaled'
    },
    // Slide the scaled TV video back 5 seconds
    {
      inputs: 'tv-scaled',
      filter: 'setpts',
      options: {
        expr: 'PTS-5/TB'
      },
      outputs: 'tv-scaled-trimmed'
    },
    // Overlay the TV screen video
    {
      inputs: ['v0', 'tv-scaled-trimmed'],
      filter: 'overlay',
      options: {
        x: 180,
        y: 160,
        shortest: 1
      },
      outputs: 'moley'
    },
    // Concatenate the two parts together
    {
      inputs: ['tv-trimmed', 'moley'],
      filter: 'concat',
      options: {
        v: 1
      },
      outputs: ['final-video']
    },

    // AUDIO
    {
      inputs: '0:a',
      filter: 'adelay',
      options: {
        delays: '5000|5000'
      },
      outputs: 'moley-audio'
    },
    {
      inputs: ['moley-audio', '1:a'],
      filter: 'amix',
      options: {
        duration: 'shortest'
      },
      outputs: 'final-audio'
    }
  ], ['final-video', 'final-audio'])
  .outputOptions('-movflags', '+faststart')
  .output(outputVideoPath)
  .on('start', commandLine => {
    console.log(commandLine);
  })
  .run();

