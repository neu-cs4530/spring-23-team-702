/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import TownController from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Video } from '../../../../types/CoveyTownSocket';
import WatchTogetherAreaController from '../../../../classes/WatchTogetherAreaController';

const ALLOWED_DRIFT = 3;

export default function WatchTogetherModal({
  watchTogetherAreaController,
  coveyTownController,
  videoPlaylist,
  isHost,
  handleNextVideo,
}: {
  watchTogetherAreaController: WatchTogetherAreaController;
  coveyTownController: TownController;
  videoPlaylist: Array<Video>;
  isHost: boolean;
  handleNextVideo: () => void;
}): JSX.Element {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string>('');
  const [reactPlayer, setReactPlayer] = useState<ReactPlayer>();

  useEffect(() => {
    if (videoPlaylist.length != 0) {
      setCurrentPlayingVideo(videoPlaylist[0].url);
    } else {
      setCurrentPlayingVideo('');
    }
  }, [setCurrentPlayingVideo, videoPlaylist]);

  useEffect(() => {
    console.log('controller changed');
    if (watchTogetherAreaController.playList[0] != undefined && reactPlayer != undefined) {
      setIsPlaying(watchTogetherAreaController.playList[0].pause);
      const currentTime = reactPlayer.getCurrentTime();
      const newTime = watchTogetherAreaController.playList[0].elapsedTimeSec;
      if (currentTime !== undefined && Math.abs(currentTime - newTime) > ALLOWED_DRIFT) {
        reactPlayer.seekTo(newTime, 'seconds');
      }
    } else {
      setIsPlaying(false);
    }
  }, [reactPlayer, watchTogetherAreaController.playList]);

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
            const currentVideo: Video = watchTogetherAreaController.playList[0];
            currentVideo.pause = false;
            coveyTownController.updateWatchTogetherVideo(watchTogetherAreaController, currentVideo);
          } else {
            console.log('Current user is not the host, cannot control the video');
            setIsPlaying(watchTogetherAreaController.playList[0].pause);
            reactPlayer?.seekTo(watchTogetherAreaController.playList[0].elapsedTimeSec);
            // TODO: replace it with the controller's video playedSeconds.
          }

          if (
            reactPlayer != undefined &&
            reactPlayer.getCurrentTime() != 0 &&
            reactPlayer.getCurrentTime() !=
              watchTogetherAreaController.playList[0].elapsedTimeSec &&
            isHost
          ) {
            const currentVideo: Video = watchTogetherAreaController.playList[0];
            currentVideo.elapsedTimeSec = reactPlayer.getCurrentTime();
            coveyTownController.updateWatchTogetherVideo(watchTogetherAreaController, currentVideo);
          }
        }}
        onEnded={() => {
          if (isHost) {
            handleNextVideo();
          }
        }}
      />
    </Box>
  );
}
