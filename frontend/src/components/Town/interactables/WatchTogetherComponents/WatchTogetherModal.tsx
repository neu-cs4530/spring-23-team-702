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
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../hooks/useTownController';
import ParticipantList from '../../../VideoCall/VideoFrontend/components/ParticipantList/ParticipantList';
import WatchTogetherYoutubePlayer from './YoutubePlayer';
import PlaylistDrawer from './PlaylistDrawer';
import {
  useInteractable,
  useWatchTogetherAreaController,
} from '../../../../classes/TownController';
import WatchTogetherAreaInteractable from '../WatchTogetherArea';
import { WatchTogetherArea } from '../../../../types/CoveyTownSocket';
import { useHost, usePlayList } from '../../../../classes/WatchTogetherAreaController';
import YoutubeLoginModal from './YoutubeLoginModal';

export function WatchTogetherVideo({
  watchTogetherArea,
}: {
  watchTogetherArea: WatchTogetherAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const watchTogetherAreaController = useWatchTogetherAreaController(watchTogetherArea.name);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState<boolean>(false);
  const hostID = useHost(watchTogetherAreaController);
  const playList = usePlayList(watchTogetherAreaController);
  const [isHost, setIsHost] = useState<boolean>(hostID === coveyTownController.ourPlayer.id);

  const handlePlaylistUpdate = (videoURL: string) => {
    coveyTownController.fetchVideoInfo(watchTogetherAreaController, videoURL);
  };

  const handleNextVideo = () => {
    coveyTownController.watchTogetherPlayNext(watchTogetherAreaController);
  };

  const toast = useToast();

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(
    !(hostID === undefined && watchTogetherAreaController != undefined),
  );

  useEffect(() => {
    if (hostID === coveyTownController.ourPlayer.id) {
      setIsHost(true);
      console.log('hostID changed');
    } else {
      console.log('host ID false');
      setIsHost(false);
    }
  }, [coveyTownController.ourPlayer.id, hostID]);

  // When being called, send a request to backend to create a WatchTogetherArea
  // with current player's id as host
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
  }, [coveyTownController, toast, watchTogetherAreaController.id]);

  if (hostID === undefined && watchTogetherAreaController) {
    createWatchTogetherArea();
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
          <Center>TV playing</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
              <Box paddingTop={'2'}>
                <Button
                  colorScheme='red'
                  onClick={() => {
                    setLoginModalIsOpen(true);
                  }}
                  inlineSize={'full'}>
                  Youtube Login
                </Button>
              </Box>

              <YoutubeLoginModal
                isOpen={loginModalIsOpen}
                onClose={function (): void {
                  setLoginModalIsOpen(false);
                }}
                handlePlaylistUpdate={handlePlaylistUpdate}
              />

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
                handleNextVideo={handleNextVideo}
              />
            </Box>
            {/*Video play box */}
            <WatchTogetherYoutubePlayer
              watchTogetherAreaController={watchTogetherAreaController}
              coveyTownController={coveyTownController}
              videoPlaylist={playList}
              isHost={isHost}
              handleNextVideo={handleNextVideo}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/**
 * The WatcherTogetherAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function WatcherTogetherAreaWrapper(): JSX.Element {
  const watchTogetherArea = useInteractable<WatchTogetherAreaInteractable>('watchTogetherArea');
  if (watchTogetherArea) {
    return <WatchTogetherVideo watchTogetherArea={watchTogetherArea} />;
  }
  return <></>;
}
