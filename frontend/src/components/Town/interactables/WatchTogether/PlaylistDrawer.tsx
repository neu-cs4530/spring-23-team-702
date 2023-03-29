import {
  Image,
  List,
  ListItem,
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

export default function PlaylistDrawer({
  drawerIsOpen,
  close,
  playList,
  handlePlaylistUpdate,
}: {
  drawerIsOpen: boolean;
  close: () => void;
  playList: Array<string>;
  handlePlaylistUpdate: (newVideoPlaylist: Array<string>) => void;
}): JSX.Element {
  const [inputVideoURL, setInputVideoURL] = useState<string>('');

  const regExpURL =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

  const isInValidYoutubeURL = !regExpURL.test(inputVideoURL) && !(inputVideoURL === '');

  const handleYotubeVideoURL = () => {
    // check if it starts with youtube.com/youtu.be and has video id after v= with 11 digits id.
    if (!isInValidYoutubeURL && !playList.includes(inputVideoURL)) {
      // if matches, update the video playlist
      const newPlaylist = [...playList];
      newPlaylist.push(inputVideoURL);
      handlePlaylistUpdate(newPlaylist);
      setInputVideoURL('');
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
          <List spacing={3}>
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
            <ListItem p='4'>
              <Image
                sizes='full'
                objectFit='contain'
                src='https://i.ytimg.com/vi/3r-gOSlYf00/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAxqTDBHAgKRDt-Pr8oqR-H0rxL_g'
                alt='Dan Abramov'
              />
              Over 100 Things You Can Do With The Create Mod - Minecraft 1.18.2
            </ListItem>
          </List>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
