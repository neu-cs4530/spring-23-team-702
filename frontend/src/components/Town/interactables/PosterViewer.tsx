import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useInteractable, usePosterSessionAreaController } from '../../../classes/TownController';
import PosterSessionAreaController, {
  useImageContents,
  useStars,
  useTitle,
} from '../../../classes/PosterSessionAreaController';
import useTownController from '../../../hooks/useTownController';
import SelectPosterModal from './SelectPosterModal';
import PosterSessionAreaInteractable from './PosterSessionArea';

/**
 * The PosterImage component does the following:
 * -- renders the image of a PosterSessionArea (in a modal)
 * -- displays the title of the PosterSessionArea as the header of the modal
 * -- displays the number of stars on the poster
 * Along with the number of stars, there is also a button to increment the number of stars on a poster (i.e.
 * where a player can star a poster). Note that a player cannot star a poster more than once (this is tied to
 * the poster itself, not the PosterSessionArea).
 *
 * @param props: A 'controller', which is the PosterSessionArea corresponding to the
 *               current poster session area.
 *             : A 'isOpen' flag, denoting whether or not the modal should open (it should open if the poster exists)
 *             : A 'close' function, to be called when the modal is closed
 */
export function PosterImage({
  controller,
  isOpen,
  close,
}: {
  controller: PosterSessionAreaController;
  isOpen: boolean;
  close: () => void;
}): JSX.Element {
  const imageContents = useImageContents(controller);
  const stars = useStars(controller);
  const title = useTitle(controller);
  const townController = useTownController();
  const curPlayerId = townController.ourPlayer.id;
  const toast = useToast();
  useEffect(() => {
    townController.getPosterSessionAreaImageContents(controller);
  }, [townController, controller]);

  // increment the stars on a poster
  // but only increment if the current player has not already starred the poster
  function incStars() {
    if (!controller.playersWhoStarred.includes(curPlayerId)) {
      controller.addPlayerWhoStarred(curPlayerId);
      townController
        .incrementPosterSessionAreaStars(controller)
        .then(newStars => (controller.stars = newStars));
    } else {
      toast({
        title: `Can't star a poster again`,
        status: 'error',
      });
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        close();
        townController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {<ModalHeader>{title} </ModalHeader>}
        <ModalCloseButton />
        <ModalBody pb={6}>
          <img src={imageContents} width='100%' height='100%' />
        </ModalBody>
        {
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={incStars}>
              Star
            </Button>
            Number of stars: {stars}
          </ModalFooter>
        }
        {/* </form> */}
      </ModalContent>
    </Modal>
  );
}

/**
 * The PosterViewer monitors the player's interaction with a PosterSessionArea on the map: displaying either
 * a popup to set the poster image and title for a poster session area, or if the image/title is set,
 * a PosterImage modal to display the poster itself.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function PosterViewer({
  posterSessionArea,
}: {
  posterSessionArea: PosterSessionAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const posterSessionAreaController = usePosterSessionAreaController(posterSessionArea.name);
  const [selectIsOpen, setSelectIsOpen] = useState(
    posterSessionAreaController.imageContents === undefined,
  );
  const posterTitle = useTitle(posterSessionAreaController);
  useEffect(() => {
    const setTitle = (title: string | undefined) => {
      if (!title) {
        townController.interactableEmitter.emit('endIteraction', posterSessionAreaController);
      } else {
        posterSessionAreaController.title = title;
      }
    };
    posterSessionAreaController.addListener('posterTitleChange', setTitle);
    return () => {
      posterSessionAreaController.removeListener('posterTitleChange', setTitle);
    };
  }, [posterSessionAreaController, townController]);
  if (!posterTitle) {
    return (
      <SelectPosterModal
        isOpen={selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "posterSessionArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(posterSessionArea);
        }}
        posterSessionArea={posterSessionArea}
      />
    );
  }
  return (
    <>
      <PosterImage
        controller={posterSessionAreaController}
        isOpen={!selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "posterSessionArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(posterSessionArea);
        }}
      />
    </>
  );
}

/**
 * The PosterViewerWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a poster session area.
 */
export default function PosterViewerWrapper(): JSX.Element {
  const posterSessionArea = useInteractable<PosterSessionAreaInteractable>('posterSessionArea');
  if (posterSessionArea) {
    return <PosterViewer posterSessionArea={posterSessionArea} />;
  }
  return <></>;
}
