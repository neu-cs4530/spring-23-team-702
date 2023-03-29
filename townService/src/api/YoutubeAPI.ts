import assert from 'assert';
import axios from 'axios';

const APIURL = 'https://www.googleapis.com/youtube/v3/';

export default class API {
  private readonly _apiKey: string;

  public constructor() {
    const key = process.env.YOUTUBE_API_KEY;
    assert(key);
    this._apiKey = key;
  }

  public getVideoDetail = async (videoURL: string) => {
    const endpoint = 'videos';
    const params = {
      part: 'snippet',
      key: this._apiKey,
      id: videoURL,
    };
    const response = await axios.get(APIURL + endpoint, { params }).then(r => r.data);

    if (!response.items[0]) return Promise.reject(new Error('Nothing was found.'));

    const { snippet } = response.items[0];

    return {
      thumbnails: snippet.thumbnails.default.url,
      title: snippet.title,
    };
  };
}
