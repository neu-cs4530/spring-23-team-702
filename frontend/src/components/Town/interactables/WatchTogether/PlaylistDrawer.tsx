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
  InputLeftElement,
  Button,
  InputRightElement,
} from '@chakra-ui/react';
import React, { useState } from 'react';

export default function PlaylistDrawer({
  drawerIsOpen,
  close,
  playList,
  setPlaylist,
}: {
  drawerIsOpen: boolean;
  close: () => void;
  playList: Array<string>;
  setPlaylist: React.Dispatch<React.SetStateAction<string[]>>;
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
        <DrawerHeader>Here is the playlist</DrawerHeader>

        <DrawerBody>
          <List spacing={3}>
            <FormControl>
              <FormLabel htmlFor='video'>Video URL</FormLabel>
              <InputGroup>
                <InputRightElement>
                  <Button
                    colorScheme='teal'
                    onClick={() => {
                      playList.push(inputVideoURL);
                      setPlaylist(playList);
                      setInputVideoURL('');
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
