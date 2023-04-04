import { Container } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useWatchTogetherAreaController } from '../../../classes/TownController';
import WatchTogetherAreaController from '../../../classes/WatchTogetherAreaController';
import { Video } from '../../../generated/client/models/WatchTogetherArea';
import useTownController from '../../../hooks/useTownController';

export function WatchTogetherVideo({
  watchTogetherArea,
}: {
  watchTogetherArea: WatchTogetherAreaController;
}): JSX.Element {
  const townController = useTownController();
  const watchTogetherAreaController = useWatchTogetherAreaController(watchTogetherArea.id);
  // we can directly passing the Video object here rather than seperating them
  const [video, setVideo] = useState(watchTogetherArea.video);
  // the front end knows host from here
  const [hostID, setHostID] = useState(watchTogetherArea.host);
  //whether the current video is playing or not
  const [isPlaying, setIsPlaying] = useState(watchTogetherArea.video?.pause === false);
  
  useEffect(() => {
    const setVideo = (video: Video | undefined) => {
      if (!video) {
        townController.interactableEmitter.emit('endIteraction', watchTogetherAreaController);
      } else {
        setVideo(video);
      }
    };
    watchTogetherAreaController.addListener('videoChange', setVideo);
    return () => {
      watchTogetherAreaController.removeListener('videoChange', setVideo);
    };
  }, [watchTogetherAreaController, townController]);
}
