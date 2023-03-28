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
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import ViewingAreaController from '../../../../classes/ViewingAreaController';
import useTownController from '../../../../hooks/useTownController';
import ParticipantList from '../../../VideoCall/VideoFrontend/components/ParticipantList/ParticipantList';
import WatchTogetherYoutubePlayer from './YoutubePlayer';
import PlaylistDrawer from './PlaylistDrawer';

export default function WatchTogetherModal({
  viewingAreaController,
  reactPlayerRef,
  isPlaying,
}: {
  viewingAreaController: ViewingAreaController;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  isPlaying: boolean;
}): JSX.Element {
  const coveyTownController = useTownController();
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(true);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<string>();
  const [playList, setPlaylist] = useState<Array<string>>([]);

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
        coveyTownController.unPause();
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
                setPlaylist={setPlaylist}
              />
            </Box>
            {/*Video play box */}
            <WatchTogetherYoutubePlayer
              viewingAreaController={viewingAreaController}
              reactPlayerRef={reactPlayerRef}
              isPlaying={isPlaying}
              coveyTownController={coveyTownController}
              videoPlayingURL={videoPlaying}
              videoPlaylist={playList}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
