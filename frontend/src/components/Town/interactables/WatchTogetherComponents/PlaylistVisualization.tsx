import { ListItem, Image, List } from '@chakra-ui/react';
import React from 'react';
import { Video } from '../../../../types/CoveyTownSocket';

export default function Playlist({ playlist }: { playlist: Video[] }): JSX.Element {
  return (
    <>
      <List spacing={3}>
        {playlist.map(video => (
          // <div key={video.call} className='station'>
          //   {station.call}
          // </div>
          <ListItem p='4' key={video.url}>
            <Image sizes='full' objectFit='contain' src={video.thumbnail} />
            {video.title}
          </ListItem>
        ))}
      </List>
    </>
  );
}
