/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Video } from './Video';

export type WatchTogetherArea = {
    id: string;
    hostID?: string;
    video?: Video;
    playList: Array<Video>;
};

