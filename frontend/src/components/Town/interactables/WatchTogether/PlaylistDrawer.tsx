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
} from '@chakra-ui/react';
import React from 'react';

export default function WatchTogetherModal({
  drawerIsOpen,
  close,
}: {
  drawerIsOpen: boolean;
  close: () => void;
}): JSX.Element {
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
