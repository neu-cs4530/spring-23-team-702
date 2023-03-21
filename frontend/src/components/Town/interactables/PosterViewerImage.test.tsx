import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { DeepMockProxy, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import PosterSessionAreaController from '../../../classes/PosterSessionAreaController';
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

describe('PosterViewer [REE3] createPoster Poster Image Viewer', () => {
  const mockToast = jest.fn();
  let posterSessionArea: PosterSessionAreaController;
  let starButton: HTMLElement;

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

    renderData = render(renderPosterSessionArea(posterSessionArea, townController));

    starButton = renderData.getByRole('button', { name: /Star/i });
  });

  describe('[REE3] cant restar a poster Starring a poster', () => {
    it('Increments the number of stars when clicking "star" button', async () => {
      const prevStars = posterSessionArea.stars;
      const starLabel = renderData.getByRole('contentinfo');
      await waitFor(() => expect(starLabel).toHaveTextContent('Number of stars: ' + prevStars));
      act(() => {
        fireEvent.click(starButton);
      });
      await waitFor(() =>
        expect(starLabel).toHaveTextContent('Number of stars: ' + (prevStars + 1)),
      );
      act(() => {
        fireEvent.click(starButton);
      });
      // don't star again
      expect(townController.incrementPosterSessionAreaStars).toHaveBeenCalledTimes(1);
      expect(townController.incrementPosterSessionAreaStars).toHaveBeenCalledWith(
        posterSessionArea,
      );
    });
    it('Displays the correct number of starting stars', () => {
      const starLabel = renderData.getByRole('contentinfo');
      expect(starLabel).toHaveTextContent('Number of stars: ' + posterSessionArea.stars);
    });
  });

  describe('[REE3] sync image contents with the town controller Viewing a poster', () => {
    it('Displays the image contents', () => {
      const image = renderData.getByRole('img');
      expect(image).toHaveAttribute('src', posterSessionArea.imageContents);
    });
    it('Only retrieves the image contents once', () => {
      renderData.rerender(renderPosterSessionArea(posterSessionArea, townController));
      expect(townController.getPosterSessionAreaImageContents).toHaveBeenCalledTimes(1);
    });
    it('Includes the title of the poster in the header', () => {
      const header = renderData.getByRole('banner');
      const { title } = posterSessionArea;
      if (title) {
        expect(header).toHaveTextContent(title);
      }
    });
    it('Unpauses the game when the modal is closed', () => {
      const close = renderData.getByRole('button', { name: /Close/i });
      act(() => {
        fireEvent.click(close);
      });
      expect(townController.unPause).toHaveBeenCalledTimes(1);
    });
  });
});
