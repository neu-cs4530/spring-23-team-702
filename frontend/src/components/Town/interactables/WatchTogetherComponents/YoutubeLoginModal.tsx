/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  List,
  ListItem,
  Image,
  Flex,
  Center,
  Box,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { loadGapiInsideDOM, loadAuth2 } from 'gapi-script';
import * as env from 'env-var';

console.log(process.env);
const GOOGLE_OAUTH_CLIENT_ID =
  '810380469783-q7lp7q66vk5t16pc03rac486r01bcgh3.apps.googleusercontent.com'; //env.get('YOUTUBE_API_KEY').required().asString();
const YOUTUBE_API_KEY = 'AIzaSyB6Sf74ZTtBYjh6OracF8STGrg77eWbmb'; //env.get('GOOGLE_OAUTH_CLIENT_ID').required().asString();

export async function addPlaylistToQueue(
  access_token: string,
  listID: string,
  handlePlaylistUpdate: (videoURL: string) => void,
): Promise<string[]> {
  const params = {
    playlistId: listID,
    part: 'snippet',
    key: YOUTUBE_API_KEY,
    access_token: access_token,
    maxResults: 50,
  };

  const response = await axios
    .get(`https://www.googleapis.com/youtube/v3/playlistItems`, { params })
    .then(r => r.data);

  if (!response.items) return Promise.reject(new Error('Nothing was found.'));

  const videoIDList: string[] = [];

  response.items.map((item: { snippet: { resourceId: { videoId: string } } }) =>
    videoIDList.push(item.snippet.resourceId.videoId),
  );

  videoIDList.map(videoID => handlePlaylistUpdate('https://www.youtube.com/watch?v=' + videoID));

  return response;
}

export function Playlist({
  playlist,
  access_token,
  handlePlaylistUpdate,
}: {
  playlist: Array<{ title: string; id: string; thumbnail: string }>;
  access_token: string;
  handlePlaylistUpdate: (videoURL: string) => void;
}): JSX.Element {
  return (
    <>
      <List spacing={3}>
        {playlist.map(video => (
          <ListItem p='4' key={video.id}>
            <Grid h='160px' templateRows='repeat(2, 1fr)' templateColumns='repeat(5, 1fr)' gap={4}>
              <GridItem rowSpan={2} colSpan={3} bg='tomato'>
                <Image objectFit='fill' src={video.thumbnail} />
              </GridItem>
              <GridItem colSpan={2} bg='white'>
                <Text color={'black'}>{video.title}</Text>
              </GridItem>
              <GridItem colSpan={2} bg='white'>
                <Button
                  colorScheme='teal'
                  onClick={() => {
                    console.log('clicked' + video.id);
                    addPlaylistToQueue(access_token, video.id, handlePlaylistUpdate);
                  }}
                  inlineSize={'full'}>
                  Add to queue
                </Button>
              </GridItem>
            </Grid>
          </ListItem>
        ))}
      </List>
    </>
  );
}

export async function fetchPlaylist(
  access_token: string,
): Promise<Array<{ title: string; id: string; thumbnail: string }>> {
  const params = {
    part: 'snippet',
    key: YOUTUBE_API_KEY,
    access_token: access_token,
    mine: true,
  };

  const response = await axios
    .get(`https://www.googleapis.com/youtube/v3/playlists`, { params })
    .then(r => r.data);

  if (!response.items) return Promise.reject(new Error('Nothing was found.'));

  console.log(response);

  const returnArray: Array<{ title: string; id: string; thumbnail: string }> = [];

  response.items.map(
    (item: {
      id: string;
      snippet: { thumbnails: { medium: { url: string } }; localized: { title: string } };
    }) =>
      returnArray.push({
        id: item.id,
        thumbnail: item.snippet.thumbnails.medium.url,
        title: item.snippet.localized.title,
      }),
  );

  return returnArray;
}

export default function YoutubeLoginModal({
  isOpen,
  onClose,
  handlePlaylistUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  handlePlaylistUpdate: (videoURL: string) => void;
}): JSX.Element {
  const [playLists, setPlatlists] = useState<
    Array<{ title: string; id: string; thumbnail: string }>
  >([]);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const login = useCallback(async () => {
    console.log(';asd');
    const gapi = await loadGapiInsideDOM();
    const auth2 = await loadAuth2(
      gapi,
      GOOGLE_OAUTH_CLIENT_ID,
      'https://www.googleapis.com/auth/youtube.readonly',
    );

    auth2.signIn();
    setIsLoggedIn(auth2.isSignedIn.get());
    setAccessToken(auth2.currentUser.get().getAuthResponse().access_token);
    setIsLoggedIn(auth2.isSignedIn.get());
  }, []);

  const getPlatlists = useCallback(async () => {
    const playlist = await fetchPlaylist(accessToken);
    setPlatlists(playlist);
  }, [accessToken]);

  useEffect(() => {
    if (isOpen && !isLoggedIn) {
      login();
    }
  }, [isLoggedIn, isOpen, login]);

  useEffect(() => {
    if (isLoggedIn) {
      getPlatlists();
    }
  }, [getPlatlists, isLoggedIn]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Youtube Login Panel</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Playlist
            playlist={playLists}
            access_token={accessToken}
            handlePlaylistUpdate={handlePlaylistUpdate}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
