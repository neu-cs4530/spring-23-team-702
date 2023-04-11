import { ListItem, Image, List } from '@chakra-ui/react';
import React from 'react';
import { Video } from '../../../../types/CoveyTownSocket';

/**
 * The playlist component renders the given playlist as a List chakra component
 *
 * @param props : A 'playlist' array of video, which contians all the video that needs to be rendered
 */
export default function Playlist({ playlist }: { playlist: Video[] }): JSX.Element {
  return (
    <>
      <List spacing={3}>
        {playlist.map(video => (
          <ListItem p='4' key={video.url}>
            <Image sizes='full' objectFit='contain' src={video.thumbnail} />
            {video.title}
          </ListItem>
        ))}
      </List>
    </>
  );
}
