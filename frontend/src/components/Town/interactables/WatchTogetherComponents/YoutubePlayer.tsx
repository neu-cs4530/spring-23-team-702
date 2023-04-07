/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Button } from '@chakra-ui/react';
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
  isHost,
}: {
  watchTogetherAreaController: WatchTogetherAreaController;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  coveyTownController: TownController;
  videoPlaylist: Array<Video>;
  isHost: boolean;
}): JSX.Element {
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  useEffect(() => {
    if (videoPlaylist.length != 0) {
      setCurrentPlayingVideo(videoPlaylist[0].url);
    } else {
      setCurrentPlayingVideo('');
    }
  }, [videoPlaylist]);

  useEffect(() => {
    if (watchTogetherAreaController.playList[0] === undefined) {
      setIsPlaying(false);
    } else {
      setIsPlaying(watchTogetherAreaController.playList[0].pause);
    }
  }, [watchTogetherAreaController]);

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
        controls={isHost}
        url={currentPlayingVideo}
        playing={isPlaying}
        onProgress={state => {
          if (
            state.playedSeconds != 0 &&
            state.playedSeconds != watchTogetherAreaController.playList[0].elapsedTimeSec
          ) {
            watchTogetherAreaController.playList[0].elapsedTimeSec = state.playedSeconds;
            coveyTownController.emitWatchTogetherAreaUpdate(watchTogetherAreaController);
          }
        }}
        onPlay={() => {
          if (!watchTogetherAreaController.playList[0].pause) {
            watchTogetherAreaController.playList[0].pause = true;
            coveyTownController.emitWatchTogetherAreaUpdate(watchTogetherAreaController);
          }
        }}
        onPause={() => {
          console.log('event trigger');
          if (watchTogetherAreaController.playList[0].pause) {
            // if(ViewingAreaController.host ==  coveyTownController.ourPlayer.id)
            watchTogetherAreaController.playList[0].pause = false;
            coveyTownController.emitWatchTogetherAreaUpdate(watchTogetherAreaController);
          }
        }}
        onEnded={() => {
          if (watchTogetherAreaController.playList[0].pause) {
            watchTogetherAreaController.playList[0].pause = false;
            coveyTownController.emitWatchTogetherAreaUpdate(watchTogetherAreaController);
          }
        }}
      />
    </Box>
  );
}
