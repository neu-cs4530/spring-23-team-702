import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { cleanup, render, RenderResult } from '@testing-library/react';
import { DeepMockProxy, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import PosterSessionAreaController, {
  PosterSessionAreaEvents,
} from '../../../classes/PosterSessionAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { mockTownController } from '../../../TestUtils';
import { PosterImage } from './PosterViewer';

function renderPosterSessionArea(
  posterSessionArea: PosterSessionAreaController,
  townController: TownController,
) {
  let selectIsOpen = posterSessionArea.imageContents === undefined;
  const close = () => {
    selectIsOpen = false;
  };
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={townController}>
        <PosterImage controller={posterSessionArea} isOpen={!selectIsOpen} close={close} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Poster Image Viewer', () => {
  const mockToast = jest.fn();
  let posterSessionArea: PosterSessionAreaController;
  type PosterSessionAreaEventName = keyof PosterSessionAreaEvents;
  let addListenerSpy: jest.SpyInstance<
    PosterSessionAreaController,
    [
      event: PosterSessionAreaEventName,
      listener: PosterSessionAreaEvents[PosterSessionAreaEventName],
    ]
  >;

  let removeListenerSpy: jest.SpyInstance<
    PosterSessionAreaController,
    [
      event: PosterSessionAreaEventName,
      listener: PosterSessionAreaEvents[PosterSessionAreaEventName],
    ]
  >;

  let townController: DeepMockProxy<TownController>;

  let renderData: RenderResult;
  beforeEach(() => {
    mockClear(mockToast);
    posterSessionArea = new PosterSessionAreaController({
      id: `id-${nanoid()}`,
      title: `title-${nanoid()}`,
      imageContents: `contents-${nanoid()}`,
      stars: 134,
    });
    townController = mockTownController({ posterSessionAreas: [posterSessionArea] });

    addListenerSpy = jest.spyOn(posterSessionArea, 'addListener');
    removeListenerSpy = jest.spyOn(posterSessionArea, 'removeListener');

    renderData = render(renderPosterSessionArea(posterSessionArea, townController));
  });

  /**
   * Retrieve the listener passed to "addListener" for a given eventName
   * @throws Error if the addListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerAdded<Ev extends EventNames<PosterSessionAreaEvents>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): PosterSessionAreaEvents[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as PosterSessionAreaEvents[Ev];
  }
  /**
   * Retrieve the listener pased to "removeListener" for a given eventName
   * @throws Error if the removeListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerRemoved<Ev extends EventNames<PosterSessionAreaEvents>>(
    eventName: Ev,
  ): PosterSessionAreaEvents[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as PosterSessionAreaEvents[Ev];
  }

  describe('PosterHooks', () => {
    it('[REE2] useStars Registers exactly one posterStarChange listener', () => {
      act(() => {
        posterSessionArea.emit('posterStarChange', 1);
      });
      act(() => {
        posterSessionArea.emit('posterStarChange', 2);
      });
      act(() => {
        posterSessionArea.emit('posterStarChange', 3);
      });
      getSingleListenerAdded('posterStarChange');
    });
    it('[REE2] useStars Unregisters exactly the same posterStarChange listener on unmounting', () => {
      act(() => {
        posterSessionArea.emit('posterStarChange', 4);
      });
      const listenerAdded = getSingleListenerAdded('posterStarChange');
      cleanup();
      expect(getSingleListenerRemoved('posterStarChange')).toBe(listenerAdded);
    });
    it('[REE2] useTitle Registers exactly one posterTitleChange listener', () => {
      act(() => {
        posterSessionArea.emit('posterTitleChange', 'Title1');
      });
      act(() => {
        posterSessionArea.emit('posterTitleChange', 'Title2');
      });
      act(() => {
        posterSessionArea.emit('posterTitleChange', 'Title3');
      });
      getSingleListenerAdded('posterTitleChange');
    });
    it('[REE2] useTitle Unregisters exactly the same posterTitleChange listener on unmounting', () => {
      act(() => {
        posterSessionArea.emit('posterTitleChange', 'Title4');
      });
      const listenerAdded = getSingleListenerAdded('posterTitleChange');
      cleanup();
      expect(getSingleListenerRemoved('posterTitleChange')).toBe(listenerAdded);
    });
    it('[REE2] useImageContents Registers exactly one posterImageContentsChange listener', () => {
      act(() => {
        posterSessionArea.emit('posterImageContentsChange', 'cont1');
      });
      act(() => {
        posterSessionArea.emit('posterImageContentsChange', 'cont2');
      });
      act(() => {
        posterSessionArea.emit('posterImageContentsChange', 'cont3');
      });
      getSingleListenerAdded('posterImageContentsChange');
    });
    it('[REE2] useImageContents Unregisters exactly the same posterImageContentsChange listener on unmounting', () => {
      act(() => {
        posterSessionArea.emit('posterImageContentsChange', 'cont4');
      });
      const listenerAdded = getSingleListenerAdded('posterImageContentsChange');
      cleanup();
      expect(getSingleListenerRemoved('posterImageContentsChange')).toBe(listenerAdded);
    });
    it('Removes the listeners and adds new ones if the controller changes', () => {
      const origStarChange = getSingleListenerAdded('posterStarChange');
      const origTitleChange = getSingleListenerAdded('posterTitleChange');
      const origImageContentsChange = getSingleListenerAdded('posterImageContentsChange');

      const newPosterSessionArea = new PosterSessionAreaController({
        id: nanoid(),
        stars: 50,
        title: nanoid(),
        imageContents: nanoid(),
      });
      const newAddListenerSpy = jest.spyOn(newPosterSessionArea, 'addListener');
      renderData.rerender(renderPosterSessionArea(newPosterSessionArea, townController));

      expect(getSingleListenerRemoved('posterStarChange')).toBe(origStarChange);
      expect(getSingleListenerRemoved('posterTitleChange')).toBe(origTitleChange);
      expect(getSingleListenerRemoved('posterImageContentsChange')).toBe(origImageContentsChange);

      getSingleListenerAdded('posterStarChange', newAddListenerSpy);
      getSingleListenerAdded('posterTitleChange', newAddListenerSpy);
      getSingleListenerAdded('posterImageContentsChange', newAddListenerSpy);
    });
  });
});
