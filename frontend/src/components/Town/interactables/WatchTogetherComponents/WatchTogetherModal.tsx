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
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import useTownController from '../../../../hooks/useTownController';
import ParticipantList from '../../../VideoCall/VideoFrontend/components/ParticipantList/ParticipantList';
import WatchTogetherYoutubePlayer from './YoutubePlayer';
import PlaylistDrawer from './PlaylistDrawer';
import { TempVideo } from '../../../../types/CoveyTownSocket';
import {
  useInteractable,
  useWatchTogetherAreaController,
} from '../../../../classes/TownController';
import WatchTogetherAreaInteractable from '../WatchTogetherArea';

export function WatchTogetherVideo({
  watchTogetherArea,
}: {
  watchTogetherArea: WatchTogetherAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const watchTogetherAreaController = useWatchTogetherAreaController(watchTogetherArea.name);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(true);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [playList, setPlaylist] = useState<Array<TempVideo>>([]);

  const handlePlaylistUpdate = (newVideoPlaylist: TempVideo[]) => {
    setPlaylist(newVideoPlaylist);
  };

  const reactPlayerRef = useRef<ReactPlayer>(null);

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
              />
            </Box>
            {/*Video play box */}
            <WatchTogetherYoutubePlayer
              watchTogetherAreaController={watchTogetherAreaController}
              reactPlayerRef={reactPlayerRef}
              coveyTownController={coveyTownController}
              videoPlaylist={playList}
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
  console.log(watchTogetherArea);
  if (watchTogetherArea) {
    console.log('created a watch together area');
    return <WatchTogetherVideo watchTogetherArea={watchTogetherArea} />;
  }
  return <></>;
}
