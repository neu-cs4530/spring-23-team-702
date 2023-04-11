/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The public-facing model that represents a town. More information about the town
 * is available for users who join it.
 */
export type Town = {
    /**
     * The name that users see on the landing page to determine which town to join
     */
    friendlyName: string;
    /**
     * An internal ID that is used to uniquely identify each town
     */
    townID: string;
    /**
     * The current number of players in this town
     */
    currentOccupancy: number;
    /**
     * The maximum number of players allowed in this town
     */
    maximumOccupancy: number;
};

