import { Container } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useWatchTogetherAreaController } from '../../../classes/TownController';
import WatchTogetherAreaController, { useHost, usePlayList, useVideo } from '../../../classes/WatchTogetherAreaController';
import { Video } from '../../../generated/client/models/WatchTogetherArea';
import useTownController from '../../../hooks/useTownController';
import WatchTogetherModal from './WatchTogetherComponents/WatchTogetherModal';

export function WatchTogetherVideo({
  watchTogetherArea,
}: {
  watchTogetherArea: WatchTogetherAreaController;
}): JSX.Element {
  const townController = useTownController();
  const watchTogetherAreaController = useWatchTogetherAreaController(watchTogetherArea.id);
  // we can directly passing the Video object here rather than seperating them
  const video = useVideo(watchTogetherArea);
  // the front end knows host from here
  const hostID = useHost(watchTogetherArea);
  //whether the current video is playing or not
  const playList = usePlayList(watchTogetherArea);

  // The interactble should end when no player exists
  // needs to find a way to set host as the player when first interact with the area
  useEffect(() => {
    const setHost = (host: string | undefined) => {
      if (!host) {
        townController.interactableEmitter.emit('endIteraction', watchTogetherAreaController);
      } else {
        watchTogetherAreaController.host = host;
      }
    };
    watchTogetherAreaController.addListener('hostChange', setHost);
    return () => {
      watchTogetherAreaController.removeListener('hostChange', setHost);
    };
  }, [watchTogetherAreaController, townController]);

  // how do we want to initiate our area when the first player enters.
  // We can ask the user for log in information their, and decide the host.
  // Or we can just skip this initiate stuff and jump into the UI.
  return (
    <>
      <WatchTogetherModal watchTogetherAreaController={watchTogetherAreaController} />
    </>
  );
}
