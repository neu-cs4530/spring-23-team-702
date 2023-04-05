import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import WatchTogetherAreaController, {
  WatchTogetherAreaEvents,
} from './WatchTogetherAreaController';
import TownController from './TownController';
import { Video, WatchTogetherArea } from '../generated/client';

describe('WatchTogetherAreaController', () => {
  let testArea: WatchTogetherAreaController;
  let testAreaModel: WatchTogetherArea;
  let newVideo: Video;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<WatchTogetherAreaEvents>();
  beforeEach(() => {
    newVideo = {
      title: 'Test',
      thumbnail: 'test',
      url: 'test url',
      durationSec: 114514,
      userID: nanoid(),
      pause: false,
      speed: 1,
      elapsedTimeSec: 8848,
    };
    testAreaModel = {
      id: nanoid(),
      video: undefined,
      playList: [],
      hostID: nanoid(),
    };
    testArea = new WatchTogetherAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.hostChange);
    mockClear(mockListeners.playlistChange);
    mockClear(mockListeners.videoChange);
    testArea.addListener('hostChange', mockListeners.hostChange);
    testArea.addListener('playlistChange', mockListeners.playlistChange);
    testArea.addListener('videoChange', mockListeners.videoChange);
  });

  describe('Setting host property', () => {
    it('updates the host and emits a hostChange event if the hostID changes', () => {
      const newHostID = nanoid();
      testArea.hostID = newHostID;
      expect(mockListeners.hostChange).toBeCalledWith(newHostID);
      expect(testArea.hostID).toEqual(newHostID);
    });
    it('does not emits a hostChange event if the hostID  does not changes', () => {
      const hostID = testArea.hostID;
      testArea.hostID = hostID;
      expect(mockListeners.hostChange).not.toBeCalled();
    });
  });
  describe('Setting Video and PlayList property', () => {
    it('updates the playList and emits a playListChange event if the playList changes', () => {
      testArea.playList = testArea.playList.concat(newVideo);
      expect(mockListeners.playlistChange).toBeCalledWith([newVideo]);
      expect(testArea.playList).toContain(newVideo);
    });
    it('does not emits a playListChange event if the playList  does not changes', () => {
      const newPlayList = testArea.playList.concat(newVideo);
      testArea.playList = newPlayList;
      testArea.playList = newPlayList;
      expect(mockListeners.playlistChange).toBeCalledTimes(1);
    });
    it('updates the video and emits a videoChange event if the video changes', () => {
      testArea.video = newVideo;
      expect(mockListeners.videoChange).toBeCalledWith(newVideo);
      expect(testArea.video).toEqual(newVideo);
    });
    it('does not emits a videoChange event if the video  does not changes', () => {
      testArea.video = undefined;
      expect(mockListeners.videoChange).not.toBeCalled();
    });
  });
  describe('watchTogetherAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.watchTogetherAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates the title, imageContents and stars properties', () => {
      const newModel: WatchTogetherArea = {
        id: testAreaModel.id,
        video: newVideo,
        playList: [newVideo],
        hostID: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.video).toEqual(newModel.video);
      expect(testArea.playList).toEqual(newModel.playList);
      expect(testArea.hostID).toEqual(newModel.hostID);
      expect(mockListeners.hostChange).toBeCalledWith(newModel.hostID);
      expect(mockListeners.playlistChange).toBeCalledWith(newModel.playList);
      expect(mockListeners.videoChange).toBeCalledWith(newModel.video);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: WatchTogetherArea = {
        id: nanoid(),
        video: undefined,
        playList: [],
        hostID: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
