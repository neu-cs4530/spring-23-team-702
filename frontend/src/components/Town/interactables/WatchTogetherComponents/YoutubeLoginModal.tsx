import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  List,
  ListItem,
  Image,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { loadGapiInsideDOM, loadAuth2 } from 'gapi-script';
import * as env from 'env-var';

const GOOGLE_OAUTH_CLIENT_ID = env.get('REACT_APP_GOOGLE_OAUTH_CLIENT_ID').required().asString();
const YOUTUBE_API_KEY = env.get('REACT_APP_YOUTUBE_API_KEY').required().asString();

/**
 * Fetch video information from the given playlist and add to the queue
 *
 * @param access_token the access token of the currently signed in user
 * @param listID id of the playlist that needs to be added
 * @param handlePlaylistUpdate function to add each individual youtube video to playlist
 */
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

/**
 * Renders the given playlists such that each playlist is rendered with thumbnail, title and a add to queu button
 *
 * @param props: A 'playlist' array containing all needed info to render the playlist
 *             : A 'access_token', the access token of the currently signed in user
 *             : A 'handlePlaylistUpdate function, to add each individual youtube video to playlist
 */
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
    const gapi = await loadGapiInsideDOM();
    const auth2 = await loadAuth2(
      gapi,
      GOOGLE_OAUTH_CLIENT_ID,
      'https://www.googleapis.com/auth/youtube.readonly',
    );

    await auth2.signIn();
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
