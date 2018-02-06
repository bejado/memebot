const fetchMock = require('fetch-mock');

const mockHash = 'abcdef';
const serverDelay = 500;

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
  } else if (jsonOpts.message == 'success') {
    return successAfterDelay({ success: true, id: mockHash });
  } else {
    return errorAfterDelay(500, 'Something broke!');
  }
});

// GET /api/job/:jobId
fetchMock.get(`/api/job/${mockHash}`, () => {
  return successAfterDelay({
    status: 'complete',
    id: mockHash,
    url:
      'https://s3-us-west-1.amazonaws.com/protected-thicket-26158-storage/4a3b7ab590f0141561de93502aba5a96.mp4'
  });
});
