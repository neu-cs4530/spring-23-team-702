/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import TownController from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Video } from '../../../../types/CoveyTownSocket';
import WatchTogetherAreaController from '../../../../classes/WatchTogetherAreaController';

export default function WatchTogetherModal({
  watchTogetherAreaController,
  reactPlayerRef,
  coveyTownController,
  videoPlaylist,
}: {
  watchTogetherAreaController: WatchTogetherAreaController;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  coveyTownController: TownController;
  videoPlaylist: Array<Video>;
}): JSX.Element {
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string>('');

  useEffect(() => {
    if (videoPlaylist.length != 0) {
      setCurrentPlayingVideo(videoPlaylist[0].url);
    } else {
      setCurrentPlayingVideo('');
    }
  }, [videoPlaylist]);

  return (
    <Box flex='4' bg='white'>
      <ReactPlayer
        ref={reactPlayerRef}
        config={{
          youtube: {
            playerVars: {
              // disable skipping time via keyboard to avoid weirdness with chat, etc
              disablekb: 1,
              autoplay: 1,
              // modestbranding: 1,
            },
          },
        }}
        p='4'
        width='100%'
        height='100%'
        controls={true}
        url={currentPlayingVideo}
        playing={true}
        // onProgress={state => {
        //   if (
        //     state.playedSeconds != 0 &&
        //     state.playedSeconds != viewingAreaController.elapsedTimeSec
        //   ) {
        //     viewingAreaController.elapsedTimeSec = state.playedSeconds;
        //     coveyTownController.emitViewingAreaUpdate(viewingAreaController);
        //   }
        // }}
        // onPlay={() => {
        //   if (!viewingAreaController.isPlaying) {
        //     viewingAreaController.isPlaying = true;
        //     coveyTownController.emitViewingAreaUpdate(viewingAreaController);
        //   }
        // }}
        // onPause={() => {
        //   if (viewingAreaController.isPlaying) {
        //     // if(ViewingAreaController.host ==  coveyTownController.ourPlayer.id)
        //     viewingAreaController.isPlaying = false;
        //     coveyTownController.emitViewingAreaUpdate(viewingAreaController);
        //   }
        // }}
        // onEnded={() => {
        //   if (viewingAreaController.isPlaying) {
        //     viewingAreaController.isPlaying = false;
        //     coveyTownController.emitViewingAreaUpdate(viewingAreaController);
        //   }
        // }}
      />
    </Box>
  );
}
