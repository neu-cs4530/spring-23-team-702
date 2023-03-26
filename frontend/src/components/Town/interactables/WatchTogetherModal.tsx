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
  Image,
  List,
  ListItem,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Center,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import ViewingAreaController from '../../../classes/ViewingAreaController';
import useTownController from '../../../hooks/useTownController';

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
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (modalIsOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, modalIsOpen]);

  return (
    <Modal
      isOpen={true}
      size={'full'}
      motionPreset='slideInBottom'
      onClose={() => {
        setModalIsOpen(false);
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Center>Basement TV playing</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex color='white'>
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
              <Drawer
                isOpen={drawerIsOpen}
                placement='right'
                onClose={() => {
                  setDrawerIsOpen(false);
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
                      <ListItem p='4'>
                        <Image
                          sizes='full'
                          objectFit='contain'
                          src='https://i.ytimg.com/vi_webp/W8_LEnpT5_I/maxresdefault.webp'
                          alt='Dan Abramov'
                        />
                        我的拜师日记：拜陈老为师学习鲁菜正宗，没想到被批基本功太懒散【醋溜海参片·糖醋瓦块鱼】
                      </ListItem>
                      <ListItem p='4'>
                        <Image
                          sizes='full'
                          objectFit='contain'
                          src='https://i.ytimg.com/vi_webp/W8_LEnpT5_I/maxresdefault.webp'
                          alt='Dan Abramov'
                        />
                        我的拜师日记：拜陈老为师学习鲁菜正宗，没想到被批基本功太懒散【醋溜海参片·糖醋瓦块鱼】
                      </ListItem>
                      <ListItem p='4'>
                        <Image
                          sizes='full'
                          objectFit='contain'
                          src='https://i.ytimg.com/vi_webp/W8_LEnpT5_I/maxresdefault.webp'
                          alt='Dan Abramov'
                        />
                        我的拜师日记：拜陈老为师学习鲁菜正宗，没想到被批基本功太懒散【醋溜海参片·糖醋瓦块鱼】
                      </ListItem>
                      <ListItem p='4'>
                        <Image
                          sizes='full'
                          objectFit='contain'
                          src='https://i.ytimg.com/vi_webp/W8_LEnpT5_I/maxresdefault.webp'
                          alt='Dan Abramov'
                        />
                        我的拜师日记：拜陈老为师学习鲁菜正宗，没想到被批基本功太懒散【醋溜海参片·糖醋瓦块鱼】
                      </ListItem>
                    </List>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
            {/*video play box */}
            <Box flex='4' bg='white'>
              <ReactPlayer
                ref={reactPlayerRef}
                config={{
                  youtube: {
                    playerVars: {
                      // disable skipping time via keyboard to avoid weirdness with chat, etc
                      disablekb: 1,
                      autoplay: 1,
                      // modestbranding: 1,
                    },
                  },
                }}
                p='4'
                width='100%'
                height='100%'
                controls={true}
                url='https://www.youtube.com/watch?v=u1JB_opf2u8'
                playing={isPlaying}
                onProgress={state => {
                  if (
                    state.playedSeconds != 0 &&
                    state.playedSeconds != viewingAreaController.elapsedTimeSec
                  ) {
                    viewingAreaController.elapsedTimeSec = state.playedSeconds;
                    coveyTownController.emitViewingAreaUpdate(viewingAreaController);
                  }
                }}
                onPlay={() => {
                  if (!viewingAreaController.isPlaying) {
                    viewingAreaController.isPlaying = true;
                    coveyTownController.emitViewingAreaUpdate(viewingAreaController);
                  }
                }}
                onPause={() => {
                  if (viewingAreaController.isPlaying) {
                    viewingAreaController.isPlaying = false;
                    coveyTownController.emitViewingAreaUpdate(viewingAreaController);
                  }
                }}
                onEnded={() => {
                  if (viewingAreaController.isPlaying) {
                    viewingAreaController.isPlaying = false;
                    coveyTownController.emitViewingAreaUpdate(viewingAreaController);
                  }
                }}
              />
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
