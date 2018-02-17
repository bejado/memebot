const videoRegex = /^https?:\/\/(www\.)?youtu/;

const validateVideoUrl = url => {
  if (url.match(videoRegex) != null) {
    return true;
  }
  return false;
};

export default validateVideoUrl;
