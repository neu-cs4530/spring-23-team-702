import getVideoDetail from './YoutubeAPI';
import { mockGetVideoDetail } from '../TestUtils';

describe('TownsController integration tests', () => {
  const videoURL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  it('Able to fetch video if url is correct', async () => {
    const response = mockGetVideoDetail(videoURL);
    expect(response.title).toBe('Rick Astley - Never Gonna Give You Up (Official Music Video)');
  });
  it('Cannot get video if the url is incorrect', async () => {
    await expect(() =>
      getVideoDetail('https://www.youtube.com/invlaid_url'),
    ).rejects.toThrowError();
  });
});
