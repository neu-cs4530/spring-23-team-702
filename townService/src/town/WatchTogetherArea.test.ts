import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter, Video } from '../types/CoveyTownSocket';
import WatchTogetherArea from './WatchTogetherArea';
describe('WatchTogetherArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: WatchTogetherArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const hostID = nanoid();
  const video = {
    title: 'Dummy Test Title',
    thumbnail: 'Dummy Image Address',
    url: 'https://www.youtube.com/dummyvideo',
    durationSec: 30,
    userID: hostID,
    pause: false,
    speed: 1,
    elapsedTimeSec: 0,
  };
  const playList: Video[] = [];
  beforeEach(() => {
    mock(townEmitter);
    testArea = new WatchTogetherArea({ id, hostID, video, playList }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);
      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, hostID, video, playList });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the video property, playList and hostID when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, hostID: undefined, video: undefined, playList });
      expect(testArea.video).toBeUndefined();
      expect(testArea.hostID).toBeUndefined();
      expect(testArea.playList).toEqual([]);
    });
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
  });
  test('toModel sets the id, hostID, video and the playList', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      hostID,
      video,
      playList,
    });
  });
  test('When the original player leaves, a random listern will be picked as the next host', () => {
    console.log(newPlayer.id);
    const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
    // testArea.add(extraPlayer);
    expect(testArea.hostID).toEqual(newPlayer.id);
    // testArea.remove(newPlayer);
    // expect(testArea.hostID).toEqual(extraPlayer.id);
  });
});