import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import PosterSessionArea from './PosterSessionArea';

describe('PosterSessionArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: PosterSessionArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const stars = 1;
  const title = 'Test Poster';
  const imageContents = readFileSync('./testData/poster.jpg', 'utf-8');

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new PosterSessionArea({ id, stars, title, imageContents }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('[OMG2 remove]', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, stars, title, imageContents });
    });
    it("Clears the player's interactableID and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the poster image and title and sets stars to zero when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        stars: 0,
        title: undefined,
        imageContents: undefined,
      });
      expect(testArea.title).toBeUndefined();
      expect(testArea.imageContents).toBeUndefined();
      expect(testArea.stars).toEqual(0);
    });
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's interactableID and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  test('[OMG2 toModel] toModel sets the ID, stars, title, and imageContents', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      stars,
      title,
      imageContents,
    });
  });
  test('[OMG2 updateModel] updateModel sets stars, title, and imageContents', () => {
    const newId = 'spam';
    const newStars = 2;
    const newTitle = 'New Test Poster Title';
    const newImageContents = 'random string not image';
    testArea.updateModel({
      id: newId,
      stars: newStars,
      title: newTitle,
      imageContents: newImageContents,
    });
    expect(testArea.stars).toBe(newStars);
    expect(testArea.id).toBe(id);
    expect(testArea.title).toBe(newTitle);
    expect(testArea.imageContents).toBe(newImageContents);
  });
  describe('[OMG2 fromMapObject]', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        PosterSessionArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new poster session area using the provided boundingBox and id, with no poster (i.e. title and image undefined, no stars), and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = PosterSessionArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.title).toBeUndefined();
      expect(val.stars).toEqual(0);
      expect(val.imageContents).toBeUndefined();
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
