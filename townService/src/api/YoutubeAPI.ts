import axios from 'axios';
import { assert } from 'console';

const APIURL = 'https://www.googleapis.com/youtube/v3/';

function getVideoID(videoURL: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = videoURL.match(regExp);
  if (match && match[7].length === 11) {
    return match[7];
  }
  return '';
}

export default async function getVideoDetail(videoURL: string): Promise<{
  thumbnails: string;
  title: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  assert(apiKey);
  const videoID = getVideoID(videoURL);

  const params = {
    part: 'snippet',
    key: apiKey,
    id: videoID,
  };

  const response = await axios.get(`${APIURL}videos`, { params }).then(r => r.data);

  if (!response.items[0]) return Promise.reject(new Error('Nothing was found.'));

  const { snippet } = response.items[0];

  return {
    thumbnails: snippet.thumbnails.default.url,
    title: snippet.title,
  };
}
