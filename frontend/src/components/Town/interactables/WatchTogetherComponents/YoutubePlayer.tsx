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
  coveyTownController,
  videoPlaylist,
  isHost,
}: {
  watchTogetherAreaController: WatchTogetherAreaController;
  coveyTownController: TownController;
  videoPlaylist: Array<Video>;
  isHost: boolean;
}): JSX.Element {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string>('');

  useEffect(() => {
    if (videoPlaylist.length != 0) {
      setCurrentPlayingVideo(videoPlaylist[0].url);
    } else {
      setCurrentPlayingVideo('');
    }
  }, [setCurrentPlayingVideo, videoPlaylist]);

  useEffect(() => {
    if (watchTogetherAreaController.playList[0] === undefined) {
      setIsPlaying(false);
    } else {
      setIsPlaying(watchTogetherAreaController.playList[0].pause);
    }
  }, [watchTogetherAreaController]);

  const [reactPlayer, setReactPlayer] = useState<ReactPlayer>();

  const ref = (player: ReactPlayer) => {
    setReactPlayer(player);
  };

  return (
    <Box flex='4' bg='white'>
      <ReactPlayer
        ref={ref}
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
            state.playedSeconds != watchTogetherAreaController.playList[0].elapsedTimeSec &&
            isHost
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
          console.log('Pause event triggered');
          setIsPlaying(false);
          if (watchTogetherAreaController.playList[0].pause && isHost) {
            // if(ViewingAreaController.host ==  coveyTownController.ourPlayer.id)
            watchTogetherAreaController.playList[0].pause = false;
            coveyTownController.emitWatchTogetherAreaUpdate(watchTogetherAreaController);
          } else {
            console.log('Current user is not the host, cannot control the video');
            setIsPlaying(true);
            reactPlayer?.seekTo(12);
            // TODO: replace it with the controller's video playedSeconds.
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
