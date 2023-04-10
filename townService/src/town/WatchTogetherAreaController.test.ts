import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import {
  Interactable,
  TownEmitter,
  PosterSessionArea,
  WatchTogetherArea,
} from '../types/CoveyTownSocket';
import TownsStore from '../lib/TownsStore';
import {
  getLastEmittedEvent,
  mockPlayer,
  MockedPlayer,
  isPosterSessionArea,
  isWatchTogetherArea,
} from '../TestUtils';
import { TownsController } from './TownsController';

type TestTownData = {
  friendlyName: string;
  townID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};
const broadcastEmitter = jest.fn();

describe('TownsController integration tests', () => {
  let controller: TownsController;

  const createdTownEmitters: Map<string, DeepMockProxy<TownEmitter>> = new Map();
  async function createTownForTesting(
    friendlyNameToUse?: string,
    isPublic = false,
  ): Promise<TestTownData> {
    const friendlyName =
      friendlyNameToUse !== undefined
        ? friendlyNameToUse
        : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await controller.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
      mapFile: 'testData/indoors.json',
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      townID: ret.townID,
      townUpdatePassword: ret.townUpdatePassword,
    };
  }
  function getBroadcastEmitterForTownID(townID: string) {
    const ret = createdTownEmitters.get(townID);
    if (!ret) {
      throw new Error(`Could not find broadcast emitter for ${townID}`);
    }
    return ret;
  }
  beforeAll(() => {
    // Set the twilio tokens to dummy values so that the unit tests can run
    process.env.TWILIO_API_AUTH_TOKEN = 'testing';
    process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
    process.env.TWILIO_API_KEY_SID = 'testing';
    process.env.TWILIO_API_KEY_SECRET = 'testing';
  });
  beforeEach(async () => {
    createdTownEmitters.clear();
    broadcastEmitter.mockImplementation((townID: string) => {
      const mockRoomEmitter = mockDeep<TownEmitter>();
      createdTownEmitters.set(townID, mockRoomEmitter);
      return mockRoomEmitter;
    });
    TownsStore.initializeTownsStore(broadcastEmitter);
    controller = new TownsController();
  });

  describe('Interactables', () => {
    let testingTown: TestTownData;
    let player: MockedPlayer;
    let sessionToken: string;
    let interactables: Interactable[];
    let hostID: string;
    beforeEach(async () => {
      testingTown = await createTownForTesting(undefined, true);
      player = mockPlayer(testingTown.townID);
      await controller.joinTown(player.socket);
      const initialData = getLastEmittedEvent(player.socket, 'initialize');
      sessionToken = initialData.sessionToken;
      interactables = initialData.interactables;
      hostID = initialData.userID;
      player.moveTo(3523, 330);
    });
    describe('Create Watch Together Area', () => {
      it('Executes without error when creating a new watch together area', async () => {
        const watchTogetherArea = interactables.find(isWatchTogetherArea) as WatchTogetherArea;
        if (!watchTogetherArea) {
          fail('Expected at least one watch together area to be returned in the initial join data');
        } else {
          const newWatchTogetherArea: WatchTogetherArea = {
            id: watchTogetherArea.id,
            playList: watchTogetherArea.playList,
            video: watchTogetherArea.video,
            hostID,
          };
          await controller.createWatchTogetherArea(
            testingTown.townID,
            sessionToken,
            newWatchTogetherArea,
          );
          // Check to see that the watch together area was successfully updated
          const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
          const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');
          if (isWatchTogetherArea(updateMessage)) {
            expect(updateMessage).toEqual(newWatchTogetherArea);
          } else {
            fail(
              'Expected an interactableUpdate to be dispatched with the new watch together area',
            );
          }
        }
      });
      it('Returns an error message if the town ID is invalid', async () => {
        const watchTogetherArea = interactables.find(isWatchTogetherArea) as WatchTogetherArea;
        const neWatchTogetherArea: WatchTogetherArea = {
          id: watchTogetherArea.id,
          playList: watchTogetherArea.playList,
          video: watchTogetherArea.video,
          hostID: watchTogetherArea.hostID,
        };
        await expect(
          controller.createWatchTogetherArea(nanoid(), sessionToken, neWatchTogetherArea),
        ).rejects.toThrow();
      });
      it('Checks for a valid session token before creating a watchTogether area', async () => {
        const invalidSessionToken = nanoid();
        const watchTogetherArea = interactables.find(isWatchTogetherArea) as WatchTogetherArea;
        const neWatchTogetherArea: WatchTogetherArea = {
          id: watchTogetherArea.id,
          playList: watchTogetherArea.playList,
          video: watchTogetherArea.video,
          hostID: watchTogetherArea.hostID,
        };
        await expect(
          controller.createWatchTogetherArea(nanoid(), invalidSessionToken, neWatchTogetherArea),
        ).rejects.toThrow();
      });
      it('Returns an error message if addWatchTogetherArea returns false', async () => {
        const watchTogetherArea = interactables.find(isWatchTogetherArea) as WatchTogetherArea;
        watchTogetherArea.id = nanoid();
        await expect(
          controller.createWatchTogetherArea(testingTown.townID, sessionToken, watchTogetherArea),
        ).rejects.toThrow();
      });
    });
    describe('Interact with existing Watch Together Area', () => {
      let watchTogetherArea: WatchTogetherArea;
      const videoURL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoURL2 = 'https://www.youtube.com/watch?v=MMq6eq8meV4&t=1240s';
      beforeEach(async () => {
        watchTogetherArea = interactables.find(isWatchTogetherArea) as WatchTogetherArea;
        if (!watchTogetherArea) {
          fail('Expected at least one poster session area to be returned in the initial join data');
        } else {
          const newWatchTogetherArea = {
            id: watchTogetherArea.id,
            hostId: hostID,
            playList: [],
            video: undefined,
          };
          await controller.createWatchTogetherArea(
            testingTown.townID,
            sessionToken,
            newWatchTogetherArea,
          );
        }
      });

      it('Get host id from the watch together area', async () => {
        const curHostID = await controller.getWatchTogetherHostID(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
        );
        expect(curHostID).toEqual(hostID);
      });
      it('Play list can add video from a url input and able to play next video', async () => {
        const video = await controller.pushWatchTogetherPlayList(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
          { url: videoURL },
        );
        expect(video.title).toEqual('Rick Astley - Never Gonna Give You Up (Official Music Video)');
        expect(video.elapsedTimeSec).toEqual(0); // video begins at 0 seconds
        expect(video.pause).toEqual(true); // video default is playing

        const video2 = await controller.pushWatchTogetherPlayList(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
          { url: videoURL2 },
        );
        const playnext = await controller.watchTogetherPlayNext(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
        );
        expect(playnext).toBe(true);
        expect(video2.title).toBe('Yuki Murata - Piano Solo Concert (Full Concert) #Anoice');
      });
      it('Play list cannot play next video if the play list is empty', async () => {
        const playnext = await controller.watchTogetherPlayNext(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
        );
        expect(playnext).toBe(false);
      });
      it('Play list cannot play next video if the play list is empty', async () => {
        await expect(async () =>
          controller.pushWatchTogetherPlayList(
            testingTown.townID,
            watchTogetherArea.id,
            sessionToken,
            { url: 'invalid youtube url' },
          ),
        ).rejects.toThrow('Nothing was found.');
      });
      it('Update video given the request body of a video', async () => {
        const video = await controller.pushWatchTogetherPlayList(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
          { url: videoURL },
        );
        video.elapsedTimeSec = 100;
        video.pause = true;
        const updatedVideo = await controller.updateWatchTogetherVideo(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
          { video },
        );
        expect(updatedVideo?.elapsedTimeSec).toBe(video.elapsedTimeSec);
        expect(updatedVideo?.pause).toBe(true);
      });
      it('Cannot Update video if video is not exist', async () => {
        const video = await controller.pushWatchTogetherPlayList(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
          { url: videoURL },
        );
        video.elapsedTimeSec = 100;
        video.pause = true;
        const playnext = await controller.watchTogetherPlayNext(
          testingTown.townID,
          watchTogetherArea.id,
          sessionToken,
        );
        expect(playnext).toBe(true); // now the video is undefined

        await expect(async () =>
          controller.updateWatchTogetherVideo(
            testingTown.townID,
            watchTogetherArea.id,
            sessionToken,
            { video },
          ),
        ).rejects.toThrowError();
      });
    });
  });
});
