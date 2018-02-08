const { processJob } = require('../job_processing');

jest.mock('../video');
jest.mock('../database');
jest.mock('../upload');

const video = require('../video');
const database = require('../database');
const upload = require('../upload');

const mockMessage = 'test message';
const mockHash = 'c72b9698fa1927e1dd12d3cf26ed84b2';

describe('processJob', () => {
  let generateVideoSpy, updateJobSpy, uploadToS3Spy;

  afterEach(() => {
    jest.clearAllMocks().restoreAllMocks();
  });

  test('uploads to S3 and updates the database after generating a video', () => {
    generateVideoSpy = jest
      .spyOn(video, 'generateVideo')
      .mockResolvedValue('local/path');
    updateJobSpy = jest.spyOn(database, 'updateJob').mockResolvedValue();
    uploadToS3Spy = jest
      .spyOn(upload, 'uploadToS3')
      .mockResolvedValue('http://mock.url');

    return processJob('test message').then(() => {
      expect(generateVideoSpy).toHaveBeenCalledWith('test message', mockHash);
      expect(uploadToS3Spy).toHaveBeenCalledWith(
        mockHash + '.mp4',
        'local/path'
      );
      expect(updateJobSpy).toHaveBeenCalledWith(
        mockHash,
        'complete',
        'http://mock.url'
      );
    });
  });

  test('updates the database to error state if video generation rejects', () => {
    generateVideoSpy = jest
      .spyOn(video, 'generateVideo')
      .mockRejectedValue({ error: 'Error generating video' });
    updateJobSpy = jest.spyOn(database, 'updateJob').mockResolvedValue();
    uploadToS3Spy = jest
      .spyOn(upload, 'uploadToS3')
      .mockResolvedValue('http://mock.url');

    return processJob('test message').then(() => {
      expect(generateVideoSpy).toHaveBeenCalledWith('test message', mockHash);
      expect(uploadToS3Spy).not.toHaveBeenCalled();
      expect(updateJobSpy).toHaveBeenCalledWith(mockHash, 'error', '');
    });
  });

  test('updates the database to error state if uploading to S3 rejects', () => {
    generateVideoSpy = jest
      .spyOn(video, 'generateVideo')
      .mockResolvedValue('local/path');
    updateJobSpy = jest.spyOn(database, 'updateJob').mockResolvedValue();
    uploadToS3Spy = jest
      .spyOn(upload, 'uploadToS3')
      .mockRejectedValue({ error: 'Error uploading to S3' });

    return processJob('test message').then(() => {
      expect(generateVideoSpy).toHaveBeenCalledWith('test message', mockHash);
      expect(uploadToS3Spy).toHaveBeenCalledWith(
        mockHash + '.mp4',
        'local/path'
      );
      expect(updateJobSpy).toHaveBeenCalledWith(mockHash, 'error', '');
    });
  });
});
