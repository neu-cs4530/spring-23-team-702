/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Video = { 
  title: string;
  thumbnail: string;
  url: string;
  durationSec: number; 
  userID: string;
  pause: boolean; 
  speed: number;
  elapsedTimeSec: number; 
};

export interface WatchTogetherArea {
  id: string;
  hostID?: string;
  video?: Video;
  playList: Video[];
}
