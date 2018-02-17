const fetchMock = require('fetch-mock');

// Configuration
const mockHash = 'abcdef';
const serverDelay = 500;
const callsToGetJob = 3;
const shouldFailToGetJob = false;
const shouldReturnErroredJob = false;

const successAfterDelay = toReturn => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(toReturn);
    }, serverDelay);
  });
};

const errorAfterDelay = (number, toReturn, isJson = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        status: number,
        sendAsJson: isJson,
        body: toReturn
      });
    }, serverDelay);
  });
};

// POST /api/job
fetchMock.post('/api/job', (url, opts) => {
  const jsonOpts = JSON.parse(opts.body);
  if (!jsonOpts.message) {
    return errorAfterDelay(400, 'A message is required');
  } else if (jsonOpts.message === 'https://youtube.com/success') {
    return successAfterDelay({ success: true, id: mockHash });
  } else {
    return errorAfterDelay(500, 'Something broke!');
  }
});

// GET /api/job/:jobId
let getJobCount = callsToGetJob;
fetchMock.get(`/api/job/${mockHash}`, () => {
  // Return pending the first 5 times, then completed job (or failure)
  if (getJobCount === 0) {
    if (shouldFailToGetJob) {
      return errorAfterDelay(400, { error: 'Job does not exist' }, true);
    } else {
      return successAfterDelay({
        status: shouldReturnErroredJob ? 'error' : 'complete',
        id: mockHash,
        url: shouldReturnErroredJob
          ? ''
          : 'https://s3-us-west-1.amazonaws.com/protected-thicket-26158-storage/4a3b7ab590f0141561de93502aba5a96.mp4'
      });
    }
  } else {
    getJobCount--;
    return successAfterDelay({
      status: 'pending',
      id: mockHash,
      url: ''
    });
  }
});
