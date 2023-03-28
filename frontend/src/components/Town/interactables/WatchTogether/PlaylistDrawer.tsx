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
  InputGroup,
  Button,
  InputRightElement,
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
        <DrawerHeader>Video playlist</DrawerHeader>

        <DrawerBody>
          <List spacing={3}>
            {/* Video URL input box */}
            <FormControl>
              <FormLabel htmlFor='video'>Video URL</FormLabel>
              <InputGroup>
                <InputRightElement>
                  <Button
                    colorScheme='teal'
                    onClick={() => {
                      const newPlaylist = [...playList];
                      newPlaylist.push(inputVideoURL);
                      handlePlaylistUpdate(newPlaylist);
                      console.log(playList);
                    }}
                    inlineSize={'full'}>
                    +
                  </Button>
                </InputRightElement>
                <Input
                  id='video'
                  name='video'
                  value={inputVideoURL}
                  onChange={e => {
                    setInputVideoURL(e.target.value);
                  }}
                />
              </InputGroup>
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
