import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import TypedEventEmitter from 'typed-emitter';
import { Video, WatchTogetherArea as WatchTogetherAreaModel } from '../types/CoveyTownSocket';

/**
 * The events that a ViewingAreaController can emit
 */
export type WatchTogetherAreaEvents = {
  /**
   * This event indicates that the playlist in this area has changed
   * Listeners are given the new playlist
   */
  playlistChange: (playlist: Video[]) => void;

  /**
   * This event indicates that the current Video status in this area has changed
   * Listeners are given the new Video information
   * !! This use the Video defined in types, hopefully can satisfy the Youtube API!!
   */
  videoChange: (video: Video | undefined) => void;

  /**
   * This event indicates that the host in this area has changed
   * Listeners are given the new host ID, or undefined if everyone left.
   */
  hostChange: (host: string | undefined) => void;
};

export default class WatchTogetherAreaController extends (EventEmitter as new () => TypedEventEmitter<WatchTogetherAreaEvents>) {
  private _model: WatchTogetherAreaModel;

  constructor(watchTogetherAreaModel: WatchTogetherAreaModel) {
    super();
    this._model = watchTogetherAreaModel;
  }

  public get id(): string {
    return this._model.id;
  }

  public get host(): string | undefined {
    return this._model.hostID;
  }

  /**
   * Set the host for the model, may need to consider the host logic
   */
  public set host(host: string | undefined) {
    if (this._model.hostID !== host) {
      this._model.hostID = host;
      this.emit('hostChange', host);
    }
  }

  public get playList(): Video[] {
    return this._model.playList;
  }

  /**
   * The play list update. If we don't want people other than host to change the playlist, or we want to implements the sequence changing of playlist
   * we need to modify this. Currently this means everyone can add to the playlist.
   *
   */
  public set playList(playList: Video[]) {
    if (this._model.playList !== playList) {
      this._model.playList = playList;
      this.emit('playlistChange', playList);
    }
  }

  public get video(): Video | undefined {
    return this._model.video;
  }

  /**
   * Set the video to new video. The host logic should be in the .tsx file
   */
  public set video(video: Video | undefined) {
    if (this._model.video !== video) {
      this._model.video = video;
      this.emit('videoChange', video);
    }
  }

  public updateFrom(updatedModel: WatchTogetherAreaModel): void {
    this._model.hostID = updatedModel.hostID;
    this._model.playList = updatedModel.playList;
    this._model.video = updatedModel.video;
  }
}

/**
 * A hook that returns the video given the controller
 */
export function useStars(controller: WatchTogetherAreaController): Video | undefined {
  const [video, setVideo] = useState(controller.video);
  useEffect(() => {
    controller.addListener('videoChange', setVideo);
    return () => {
      controller.removeListener('videoChange', setVideo);
    };
  }, [controller]);
  return video;
}

/**
 * A hook that returns the video given the controller
 */
export function usePlayList(controller: WatchTogetherAreaController): Video[] {
  const [playList, setPlayList] = useState(controller.playList);
  useEffect(() => {
    controller.addListener('playlistChange', setPlayList);
    return () => {
      controller.removeListener('playlistChange', setPlayList);
    };
  }, [controller]);
  return playList;
}

/**
 * A hook that returns the video given the controller
 */
export function useHost(controller: WatchTogetherAreaController): string | undefined {
  const [hostID, useHostID] = useState(controller.host);
  useEffect(() => {
    controller.addListener('hostChange', useHostID);
    return () => {
      controller.removeListener('hostChange', useHostID);
    };
  }, [controller]);
  return hostID;
}
