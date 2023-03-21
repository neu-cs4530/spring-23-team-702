import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import TypedEventEmitter from 'typed-emitter';
import { PosterSessionArea as PosterSessionAreaModel } from '../types/CoveyTownSocket';

/**
 * The events that a PosterSessionAreaController can emit
 */
export type PosterSessionAreaEvents = {
  /**
   * A posterTitleChange event indicates that the poster title has changed.
   * Listeners are passed the new state in new title.
   */
  posterTitleChange: (title: string | undefined) => void;
  /**
   * A posterTitleChange event indicates that the poster title has changed.
   * Listeners are passed the new state in new title.
   */
  posterImageContentsChange: (imageContents: string | undefined) => void;
  /**
   * A posterStarChange event indicates that the number of stars on the poster has changed.
   * Listeners are passed the new number of stars.
   */
  posterStarChange: (stars: number) => void;
};

/**
 * A PosterSessionAreaController manages the state for a PosterSessionArea in the frontend app, serving as a bridge between the poster
 * image that is being displayed in the user's browser and the backend TownService, and ensuring that star updates are
 * synchronized across all the players looking at the poster.
 *
 * The PosterSessionAreaController implements callbacks that handle events from the poster image in this browser window, and
 * emits updates when the state is updated, @see PosterSessionAreaEvents
 */
export default class PosterSessionAreaController extends (EventEmitter as new () => TypedEventEmitter<PosterSessionAreaEvents>) {
  private _model: PosterSessionAreaModel;

  private _playersWhoStarred: string[];

  /**
   * Constructs a new PosterSessionAreaController, initialized with the state of the
   * provided posterSessionAreaModel.
   *
   * @param posterSessionAreaModel The poster session area model that this controller should represent
   */
  constructor(posterSessionAreaModel: PosterSessionAreaModel) {
    super();
    this._model = posterSessionAreaModel;
    this._playersWhoStarred = [];
  }

  /**
   * The ID of the poster session area represented by this poster session area controller
   * This property is read-only: once a PosterSessionAreaController is created, it will always be
   * tied to the same poster session area ID.
   */
  public get id(): string {
    return this._model.id;
  }

  /**
   * The title of the poster assigned to this area, or undefined if there is not one.
   */
  public get title(): string | undefined {
    return this._model.title;
  }

  public set title(title: string | undefined) {
    if (this._model.title !== title) {
      this._model.title = title;
      this.emit('posterTitleChange', title);
    }
  }

  /**
   * The image of the poster assigned to this area, or undefined if there is not one.
   */
  public get imageContents(): string | undefined {
    return this._model.imageContents;
  }

  public set imageContents(imageContents: string | undefined) {
    if (this._model.imageContents !== imageContents) {
      this._model.imageContents = imageContents;
      // if we're replacing the poster contents, then reset the players who starred to zero
      this._playersWhoStarred = [];
      this.emit('posterImageContentsChange', imageContents);
    }
  }

  /**
   * The number of stars of the poster assigned to this area.
   */
  public get stars(): number {
    return this._model.stars;
  }

  /**
   * The number of stars of the poster assigned to this area.
   *
   * Changing this value will emit a ‘posterStarChange' event to listeners
   */
  public set stars(stars: number) {
    if (this._model.stars !== stars && stars > 0) {
      this._model.stars = stars;
      this.emit('posterStarChange', stars);
    }
  }

  public get playersWhoStarred(): string[] {
    return this._playersWhoStarred;
  }

  public addPlayerWhoStarred(playerID: string) {
    this._playersWhoStarred.push(playerID);
  }

  /**
   * @returns PosterSessionAreaModel that represents the current state of this PosterSessionAreaController
   */
  public posterSessionAreaModel(): PosterSessionAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this poster session area controller's model, setting the fields
   * image, stars, and title from the updatedModel
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: PosterSessionAreaModel): void {
    // note: this calls the setters; really we're updating the model
    this.title = updatedModel.title;
    this.imageContents = updatedModel.imageContents;
    this.stars = updatedModel.stars;
  }
}

/**
 * A hook that returns the number of stars for the poster session area with the given controller
 */
export function useStars(controller: PosterSessionAreaController): number {
  const [stars, setStars] = useState(controller.stars);
  useEffect(() => {
    controller.addListener('posterStarChange', setStars);
    return () => {
      controller.removeListener('posterStarChange', setStars);
    };
  }, [controller]);
  return stars;
}

/**
 * A hook that returns the image contents for the poster session area with the given controller
 */
export function useImageContents(controller: PosterSessionAreaController): string | undefined {
  const [imageContents, setImageContents] = useState(controller.imageContents);
  useEffect(() => {
    controller.addListener('posterImageContentsChange', setImageContents);
    return () => {
      controller.removeListener('posterImageContentsChange', setImageContents);
    };
  }, [controller]);
  return imageContents;
}

/**
 * A hook that returns the title for the poster session area with the given controller
 */
export function useTitle(controller: PosterSessionAreaController): string | undefined {
  const [title, setTitle] = useState(controller.title);
  useEffect(() => {
    controller.addListener('posterTitleChange', setTitle);
    return () => {
      controller.removeListener('posterTitleChange', setTitle);
    };
  }, [controller]);
  return title;
}
