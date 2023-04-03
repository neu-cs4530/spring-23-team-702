import { ListItem, Image, List } from '@chakra-ui/react';
import React from 'react';
import { TempVideo } from '../../../../types/CoveyTownSocket';

export default function Playlist({ playlist }: { playlist: Array<TempVideo> }): JSX.Element {
  return (
    <>
      <List spacing={3}>
        {playlist.map(video => (
          // <div key={video.call} className='station'>
          //   {station.call}
          // </div>
          <ListItem p='4' key={video.videoID}>
            <Image sizes='full' objectFit='contain' src={video.videoThumbnail} />
            {video.videoTitle}
          </ListItem>
        ))}
      </List>
    </>
  );
}
