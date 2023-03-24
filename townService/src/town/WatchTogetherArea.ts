import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  Interactable,
  BoundingBox,
  TownEmitter,
  Video,
  WatchTogetherArea as WatchTogetherAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class WatchTogetherArea extends InteractableArea {
  private _hostID?: string;

  private _viewerByID: string[];

  private _video?: Video;

  private _playList: Video[];

  public get hostID() {
    return this._hostID;
  }

  public get viewerByID() {
    return this._viewerByID;
  }

  public get video() {
    return this._video;
  }

  public get playList() {
    return this._playList;
  }

  /**
   *
   */
  public constructor(
    { id, hostID, viewerByID, video, playList }: WatchTogetherAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._hostID = hostID;
    this._viewerByID = viewerByID;
    this._video = video;
    this._playList = playList;
  }

  /**
   * Removes a player from this poster session area.
   * If the host leave, we want to randomly chosse one of the viewer in our viewer lists as our host.
   * When the last player leaves, including the case when host is the last player, this method clears the poster and title, and resets the number of stars, and emits this update to all players in the Town.
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._video = undefined;
      this._hostID = undefined;
      this._playList = [];
    } else if (this.hostID !== undefined && player.id === this.hostID) {
      const { occupantsByID } = this;
      this._hostID = occupantsByID[Math.floor(Math.random() * occupantsByID.length)];
    }

    this._emitAreaChanged();
  }

  /**
   * Updates the state of this WatchTogetherArea, setting the  hostID, viewerByID, video, playList  properties
   *
   * @param WatchTogetherAreaModel updated model
   */
  public updateModel({ id, hostID, viewerByID, video, playList }: WatchTogetherAreaModel) {
    this._hostID = hostID;
    this._viewerByID = viewerByID;
    this._video = video;
    this._playList = playList;
  }

  /**
   *
   */
  public toModel(): WatchTogetherAreaModel {
    return {
      id: this.id,
      hostID: this._hostID,
      viewerByID: this._viewerByID,
      video: this.video,
      playList: this._playList,
    };
  }

  /**
   * Creates a new WatchTogetherArea object that will represent a WatchTogether Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter,
  ): WatchTogetherAreaModel {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new WatchTogetherArea(
      {
        id: name,
        hostID: undefined,
        viewerByID: [],
        video: undefined,
        playList: [],
      },
      rect,
      townEmitter,
    );
  }
}
