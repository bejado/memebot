const { generateVideo } = require('../video');
const mockSpawn = require('mock-spawn');

jest.mock('child_process');

const childProcess = require('child_process');

describe('generateVideo', () => {
  let videoScriptMockSpawn = mockSpawn();
  jest.spyOn(childProcess, 'spawn').mockImplementation(videoScriptMockSpawn);

  test('returns a resolved promise if the video generation script exits successfully', () => {
    videoScriptMockSpawn.setDefault(
      videoScriptMockSpawn.simple(0, 'Video script output...')
    );
    return expect(
      generateVideo('https://www.youtube.com/watch?v=KMU0tzLwhbE', 'abcdef')
    ).resolves.toBe('generated/abcdef.mp4');
  });

  test('returns a rejected promise if the video generation script exists with an error code', () => {
    videoScriptMockSpawn.setDefault(
      videoScriptMockSpawn.simple(1, 'Video script output...')
    );
    return expect(
      generateVideo('https://www.youtube.com/watch?v=KMU0tzLwhbE', 'abcdef')
    ).rejects.toThrow();
  });
});
