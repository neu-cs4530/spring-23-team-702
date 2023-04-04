import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import ViewingAreaController from '../../../../classes/ViewingAreaController';
import TownController from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { TempVideo } from '../../../../types/CoveyTownSocket';

export default function WatchTogetherModal({
  viewingAreaController,
  reactPlayerRef,
  isPlaying,
  coveyTownController,
  videoPlaylist,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hostID,
}: {
  viewingAreaController: ViewingAreaController;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  isPlaying: boolean;
  coveyTownController: TownController;
  videoPlaylist: Array<TempVideo>;
  hostID: string;
}): JSX.Element {
  console.log(useTownController().ourPlayer.id);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string>('');

  useEffect(() => {
    if (videoPlaylist.length != 0) {
      setCurrentPlayingVideo(videoPlaylist[0].videoID);
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
        playing={isPlaying}
        onProgress={state => {
          if (
            state.playedSeconds != 0 &&
            state.playedSeconds != viewingAreaController.elapsedTimeSec
          ) {
            viewingAreaController.elapsedTimeSec = state.playedSeconds;
            coveyTownController.emitViewingAreaUpdate(viewingAreaController);
          }
        }}
        onPlay={() => {
          if (!viewingAreaController.isPlaying) {
            viewingAreaController.isPlaying = true;
            coveyTownController.emitViewingAreaUpdate(viewingAreaController);
          }
        }}
        onPause={() => {
          if (viewingAreaController.isPlaying) {
            // if(ViewingAreaController.host ==  coveyTownController.ourPlayer.id)
            viewingAreaController.isPlaying = false;
            coveyTownController.emitViewingAreaUpdate(viewingAreaController);
          }
        }}
        onEnded={() => {
          if (viewingAreaController.isPlaying) {
            viewingAreaController.isPlaying = false;
            coveyTownController.emitViewingAreaUpdate(viewingAreaController);
          }
        }}
      />
    </Box>
  );
}
