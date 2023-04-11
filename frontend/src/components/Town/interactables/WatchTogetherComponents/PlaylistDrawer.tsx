import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormErrorMessage,
  Box,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Video } from '../../../../types/CoveyTownSocket';
import Playlist from './PlaylistVisualization';

export default function PlaylistDrawer({
  drawerIsOpen,
  close,
  playList,
  handlePlaylistUpdate,
  handleNextVideo,
}: {
  drawerIsOpen: boolean;
  close: () => void;
  playList: Array<Video>;
  handlePlaylistUpdate: (videoURL: string) => void;
  handleNextVideo: () => void;
}): JSX.Element {
  const [inputVideoURL, setInputVideoURL] = useState<string>('');

  const regExpURL =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

  const isInValidYoutubeURL = !regExpURL.test(inputVideoURL) && !(inputVideoURL === '');

  const handleYotubeVideoURL = async () => {
    // check if it starts with youtube.com/youtu.be and has video id after v= with 11 digits id.
    if (!isInValidYoutubeURL && !(playList.filter(e => e.url === inputVideoURL).length > 0)) {
      // if matches, update the video playlist
      handlePlaylistUpdate(inputVideoURL);
    }
  };

  return (
    <Drawer
      isOpen={drawerIsOpen}
      placement='left'
      onClose={() => {
        close();
      }}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Control panel</DrawerHeader>

        <DrawerBody>
          {/* Video URL input box */}
          <FormControl isInvalid={isInValidYoutubeURL}>
            <FormLabel htmlFor='video'>Video URL</FormLabel>
            <Input
              id='video'
              name='video'
              value={inputVideoURL}
              placeholder={'Paste youtube video url here'}
              onChange={e => {
                setInputVideoURL(e.target.value);
              }}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleYotubeVideoURL();
                }
              }}
            />
            <FormErrorMessage>Please input a valid Youtube video URL</FormErrorMessage>
          </FormControl>
          {/* Next video play button */}
          <Box paddingTop={'2'}>
            <Button
              colorScheme='teal'
              onClick={() => {
                // const newPlaylist = [...playList];
                // newPlaylist.shift();
                // handlePlaylistUpdate(newPlaylist);
                // console.log(newPlaylist);
                handleNextVideo();
              }}
              inlineSize={'full'}>
              Next video
            </Button>
          </Box>
          {/* Video preview list */}
          <Playlist playlist={playList}></Playlist>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
