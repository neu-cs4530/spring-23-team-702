import { Box } from '@chakra-ui/react';
import React from 'react';
import ReactPlayer from 'react-player';
import ViewingAreaController from '../../../../classes/ViewingAreaController';
import TownController from '../../../../classes/TownController';

export default function WatchTogetherModal({
  viewingAreaController,
  reactPlayerRef,
  isPlaying,
  coveyTownController,
  videoPlaylist,
}: {
  viewingAreaController: ViewingAreaController;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  isPlaying: boolean;
  coveyTownController: TownController;
  videoPlayingURL: string | undefined;
  videoPlaylist: Array<string>;
}): JSX.Element {
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
        url={videoPlaylist[0]}
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
