import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Watch } from 'typescript';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter, Video } from '../types/CoveyTownSocket';
import WatchTogetherArea from './WatchTogetherArea';

describe('WatchingTogetherArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: WatchTogetherArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const newVideo: Video = {
    title: 'Test',
    thumbnail: 'test',
    url: 'test url',
    userID: nanoid(),
    pause: false,
    speed: 1,
    elapsedTimeSec: 8848,
  };
  const playList: Video[] = [];
  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new WatchTogetherArea({ id, playList }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
    it('Add the player into empty area will set the id as host', () => {
      const curHostID = newPlayer.id;
      expect(testArea.hostID).toEqual(curHostID);
    });
    it('Add the player into an already occupied area will not change hostID', () => {
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      const curHostID = newPlayer.id;
      expect(testArea.hostID).toEqual(curHostID);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants will emits an interactableUpdate event and pass host to a random existing id', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);
      const hostID = extraPlayer.id;
      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, hostID, video: undefined, playList });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the property when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, hostID: undefined, video: undefined, playList: [] });
      expect(testArea.video).toBeUndefined();
    });
  });
  test('toModel sets the ID, video, isPlaying and elapsedTimeSec', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      hostID: newPlayer.id,
      video: undefined,
      playList: [],
    });
  });
  test('updateModel sets video, isPlaying and elapsedTimeSec', () => {
    testArea.updateModel({
      id: 'ignore',
      video: newVideo,
      hostID: 'test id',
      playList: [newVideo],
    });
    expect(testArea.video).toBe(newVideo);
    expect(testArea.id).toBe(id);
    expect(testArea.hostID).toBe('test id');
    expect(testArea.playList[0]).toBe(newVideo);
  });

  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        WatchTogetherArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new viewing area using the provided boundingBox and id, with isPlaying defaulting to false and progress to 0, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = WatchTogetherArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.video).toBeUndefined();
      expect(val.playList).toEqual([]);
      expect(val.hostID).toBeUndefined();
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
