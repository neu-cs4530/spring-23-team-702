import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PosterSessionArea } from '../generated/client';
import TownController from './TownController';
import PosterSessionAreaController, {
  PosterSessionAreaEvents,
} from './PosterSessionAreaController';

describe('[REE1] PosterSessionAreaController', () => {
  // A valid PosterSessionArea to be reused within the tests
  let testArea: PosterSessionAreaController;
  let testAreaModel: PosterSessionArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<PosterSessionAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      title: nanoid(),
      imageContents: nanoid(),
      stars: 1,
    };
    testArea = new PosterSessionAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.posterImageContentsChange);
    mockClear(mockListeners.posterStarChange);
    mockClear(mockListeners.posterTitleChange);
    testArea.addListener('posterTitleChange', mockListeners.posterTitleChange);
    testArea.addListener('posterImageContentsChange', mockListeners.posterImageContentsChange);
    testArea.addListener('posterStarChange', mockListeners.posterStarChange);
  });
  describe('Setting star property', () => {
    it('updates the property and emits a posterStarChange event if the property changes', () => {
      const newStars = ++testArea.stars;
      expect(mockListeners.posterStarChange).toBeCalledWith(newStars);
      expect(testArea.stars).toEqual(newStars);
    });
    it('does not emit a posterStarChange event if the star property does not change', () => {
      testArea.stars = testAreaModel.stars;
      expect(mockListeners.posterStarChange).not.toBeCalled();
    });
  });
  describe('Setting title property', () => {
    it('updates the property and emits a posterTitleChange event if the property changes', () => {
      const newTitle = nanoid();
      testArea.title = newTitle;
      expect(mockListeners.posterTitleChange).toBeCalledWith(newTitle);
      expect(testArea.title).toEqual(newTitle);
    });
    it('does not emit a posterTitleChange event if the title property does not change', () => {
      testArea.title = `${testAreaModel.title}`;
      expect(mockListeners.posterTitleChange).not.toBeCalled();
    });
  });
  describe('Setting imageContents property', () => {
    it('updates the property and emits a posterImageContentsChange event if the property changes', () => {
      const newContents = nanoid();
      testArea.imageContents = newContents;
      expect(mockListeners.posterImageContentsChange).toBeCalledWith(newContents);
      expect(testArea.imageContents).toEqual(newContents);
    });
    it('does not emit a posterImageContentsChange event if the title property does not change', () => {
      testArea.imageContents = `${testAreaModel.imageContents}`;
      expect(mockListeners.posterImageContentsChange).not.toBeCalled();
    });
  });
  describe('posterSessionAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.posterSessionAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates the title, imageContents and stars properties', () => {
      const newModel: PosterSessionArea = {
        id: testAreaModel.id,
        title: nanoid(),
        imageContents: nanoid(),
        stars: testAreaModel.stars + 1,
      };
      testArea.updateFrom(newModel);
      expect(testArea.title).toEqual(newModel.title);
      expect(testArea.imageContents).toEqual(newModel.imageContents);
      expect(testArea.stars).toEqual(newModel.stars);
      expect(mockListeners.posterStarChange).toBeCalledWith(newModel.stars);
      expect(mockListeners.posterTitleChange).toBeCalledWith(newModel.title);
      expect(mockListeners.posterImageContentsChange).toBeCalledWith(newModel.imageContents);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: PosterSessionArea = {
        id: nanoid(),
        title: nanoid(),
        imageContents: nanoid(),
        stars: testAreaModel.stars + 1,
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
