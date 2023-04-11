import {
  ConversationArea,
  Interactable,
  PosterSessionArea,
  ViewingArea,
  WatchTogetherArea,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

/**
 * Test to see if an interactable is a poster session area
 */
export function isPosterSessionArea(interactable: Interactable): interactable is PosterSessionArea {
  return 'stars' in interactable;
}

/**
 * Test to see if an interactable is a Watch Together session area
 */
export function isWatchTogetherArea(interactable: Interactable): interactable is WatchTogetherArea {
  return 'playList' in interactable;
}
