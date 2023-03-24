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
  useToast,
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
import { useViewingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { ViewingArea as ViewingAreaModel } from '../../../types/CoveyTownSocket';
import VideoOverlay from '../../VideoCall/VideoOverlay/VideoOverlay';
import ViewingArea from './ViewingArea';

export default function SelectVideoModal({
  isOpen,
  close,
  viewingArea,
}: {
  isOpen: boolean;
  close: () => void;
  viewingArea: ViewingArea;
}): JSX.Element {
  const coveyTownController = useTownController();
  const viewingAreaController = useViewingAreaController(viewingArea?.name);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [video, setVideo] = useState<string>(viewingArea?.defaultVideoURL || '');

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  const toast = useToast();

  const createViewingArea = useCallback(async () => {
    if (video && viewingAreaController) {
      const request: ViewingAreaModel = {
        id: viewingAreaController.id,
        video,
        isPlaying: true,
        elapsedTimeSec: 0,
      };
      try {
        await coveyTownController.createViewingArea(request);
        toast({
          title: 'Video set!',
          status: 'success',
        });
        coveyTownController.unPause();
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
    }
  }, [video, coveyTownController, viewingAreaController, toast]);

  return (
    <Modal
      isOpen={isOpen}
      size={'full'}
      motionPreset='slideInBottom'
      onClose={() => {
        closeModal();
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
              />
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
