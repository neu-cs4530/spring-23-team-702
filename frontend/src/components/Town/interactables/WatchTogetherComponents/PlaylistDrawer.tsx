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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Video } from '../../../../types/CoveyTownSocket';
import Playlist from './PlayistVisualization';

export default function PlaylistDrawer({
  drawerIsOpen,
  close,
  playList,
  handlePlaylistUpdate,
}: {
  drawerIsOpen: boolean;
  close: () => void;
  playList: Array<Video>;
  handlePlaylistUpdate: (newVideoPlaylist: Array<Video>) => void;
}): JSX.Element {
  const [inputVideoURL, setInputVideoURL] = useState<string>('');

  const regExpURL =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

  const isInValidYoutubeURL = !regExpURL.test(inputVideoURL) && !(inputVideoURL === '');

  const handleYotubeVideoURL = async () => {
    // check if it starts with youtube.com/youtu.be and has video id after v= with 11 digits id.
    if (!isInValidYoutubeURL && !(playList.filter(e => e.url === inputVideoURL).length > 0)) {
      // if matches, update the video playlist
      // const newPlaylist = [...playList];
      // const apiResponse = await getVideoDetail(inputVideoURL);
      // const playlistItem: Video = {
      //   url: inputVideoURL,
      //   thumbnail: apiResponse.thumbnails,
      //   title: apiResponse.title,
      // };
      // newPlaylist.push(playlistItem);
      // handlePlaylistUpdate(newPlaylist);
      // setInputVideoURL('');
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
          <Button
            colorScheme='teal'
            onClick={() => {
              const newPlaylist = [...playList];
              newPlaylist.shift();
              handlePlaylistUpdate(newPlaylist);
              console.log(newPlaylist);
            }}
            inlineSize={'full'}>
            Next video
          </Button>
          {/* Video preview list */}
          <Playlist playlist={playList}></Playlist>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
