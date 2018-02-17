import validateVideoUrl from './urlValidator';

describe('urlValidator', () => {
  it('Returns false for an empty string', () => {
    expect(validateVideoUrl('')).toEqual(false);
  });

  it('Returns true for a valid Youtube link', () => {
    expect(
      validateVideoUrl('https://www.youtube.com/watch?v=L92TOY6vlLY')
    ).toEqual(true);
  });

  it('Returns false for random text', () => {
    expect(validateVideoUrl('abcdef')).toEqual(false);
  });

  it('Returns false for non-youtube webiste', () => {
    expect(validateVideoUrl('https://facebook.com')).toEqual(false);
  });

  it('Returns false for invalid url that does not start with protocol', () => {
    expect(validateVideoUrl('invalidurlhttps://www.youtube.com')).toEqual(
      false
    );
  });

  it('Returns true for a valid Youtube link with time offset', () => {
    expect(validateVideoUrl('https://youtu.be/kyauDV_QKDg?t=279')).toEqual(
      true
    );
  });

  it('Returns true for a valid http Youtube link', () => {
    expect(validateVideoUrl('http://youtu.be/kyauDV_QKDg?t=279')).toEqual(true);
  });
});
