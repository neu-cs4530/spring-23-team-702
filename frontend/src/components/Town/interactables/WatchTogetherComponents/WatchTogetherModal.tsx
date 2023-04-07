/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Center,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import useTownController from '../../../../hooks/useTownController';
import ParticipantList from '../../../VideoCall/VideoFrontend/components/ParticipantList/ParticipantList';
import WatchTogetherYoutubePlayer from './YoutubePlayer';
import PlaylistDrawer from './PlaylistDrawer';
import {
  useInteractable,
  useWatchTogetherAreaController,
} from '../../../../classes/TownController';
import WatchTogetherAreaInteractable from '../WatchTogetherArea';
import { WatchTogetherArea, Video } from '../../../../types/CoveyTownSocket';
import { useVideo, useHost, usePlayList } from '../../../../classes/WatchTogetherAreaController';

export function WatchTogetherVideo({
  watchTogetherArea,
}: {
  watchTogetherArea: WatchTogetherAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const watchTogetherAreaController = useWatchTogetherAreaController(watchTogetherArea.name);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  // we can directly passing the Video object here rather than seperating them
  const video = useVideo(watchTogetherAreaController);
  // the front end knows host from here
  const hostID = useHost(watchTogetherAreaController);
  // whether the current video is playing or not
  const playList = usePlayList(watchTogetherAreaController);
  const [isHost, setIsHost] = useState<boolean>(hostID === coveyTownController.ourPlayer.id);

  const handlePlaylistUpdate = (videoURL: string) => {
    coveyTownController.fetchVideoInfo(watchTogetherAreaController, videoURL);
    coveyTownController.emitWatchTogetherAreaUpdate(watchTogetherAreaController);
  };

  const handleNextVideo = () => {
    coveyTownController.watchTogetherPlayNext(watchTogetherAreaController);
  };

  const reactPlayerRef = useRef<ReactPlayer>(null);

  const toast = useToast();

  useEffect(() => {
    if (hostID === coveyTownController.ourPlayer.id) {
      setIsHost(true);
      //Is control able to update by reinitiating the reactPlayerRef?
    } else {
      setIsHost(false);
    }
  }, [coveyTownController.ourPlayer.id, hostID]);

  const createWatchTogetherArea = useCallback(async () => {
    const request: WatchTogetherArea = {
      id: watchTogetherAreaController.id,
      hostID: coveyTownController.ourPlayer.id,
      playList: [],
    };
    try {
      await coveyTownController.createWatchTogetherArea(request);
      coveyTownController.unPause();
      setModalIsOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: 'Unable to set video URL',
          description: err.toString(),
          status: 'error',
        });
      } else {
        console.trace(err);
        toast({
          title: 'Unexpected Error',
          status: 'error',
        });
      }
    }
  }, [coveyTownController, toast, watchTogetherAreaController.id]); // why there is dependencies here, might want to delete them

  if (hostID === undefined && watchTogetherAreaController) {
    console.log('uiasdasd');
    createWatchTogetherArea();
  } else if (!modalIsOpen) {
    console.log('im here');
    setModalIsOpen(true);
  }

  useEffect(() => {
    if (modalIsOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, modalIsOpen]);

  return (
    <Modal
      isOpen={modalIsOpen}
      size={'full'}
      motionPreset='slideInBottom'
      onClose={() => {
        setModalIsOpen(false);
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {/* TODO: will be updated with 'TV playing ${video title}' */}
          <Center>Basement TV playing</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* TODO: probably having a dark mode would be great? (stretch goal) */}
          <Flex color='white'>
            {/* Flex div divided into two box with 1:4 ratio */}
            <Box
              h='calc(90vh)'
              flex='1'
              bg='white'
              overflowY='auto'
              paddingRight={'6'}
              paddingLeft={'1'}
              paddingBottom={'1'}
              paddingTop={'1'}>
              <Button
                colorScheme='teal'
                onClick={() => {
                  setDrawerIsOpen(true);
                }}
                inlineSize={'full'}>
                Open Playlist
              </Button>
              {/* Video chat box list for discussion */}
              <Box paddingTop={'6'} overflowY='auto'>
                <ParticipantList />
              </Box>
              {/* Playlist drawer overlay where user select and add videos */}
              <PlaylistDrawer
                drawerIsOpen={drawerIsOpen}
                close={function (): void {
                  setDrawerIsOpen(false);
                }}
                playList={playList}
                handlePlaylistUpdate={handlePlaylistUpdate}
                townController={coveyTownController}
                watchTogetherAreaController={watchTogetherAreaController}
                handleNextVideo={handleNextVideo}
              />
            </Box>
            {/*Video play box */}
            <WatchTogetherYoutubePlayer
              watchTogetherAreaController={watchTogetherAreaController}
              reactPlayerRef={reactPlayerRef}
              coveyTownController={coveyTownController}
              videoPlaylist={playList}
              isHost={isHost}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function WatcherTogetherAreaWrapper(): JSX.Element {
  const watchTogetherArea = useInteractable<WatchTogetherAreaInteractable>('watchTogetherArea');
  if (watchTogetherArea) {
    return <WatchTogetherVideo watchTogetherArea={watchTogetherArea} />;
  }
  return <></>;
}
