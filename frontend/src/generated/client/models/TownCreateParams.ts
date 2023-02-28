/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Request body that specifies how to create a new town
 */
export type TownCreateParams = {
    /**
     * A "Friendly Name" to use to identify the newly created town, which need not be unique to existing towns names
     */
    friendlyName: string;
    /**
     * Players will identify towns by either knowing the (randomly generated) town ID, or the town ID will be publicly
     * listed along wiht the friendly name of the town. This behavior can be controlled when creating the town by changing
     * this flag.
     */
    isPubliclyListed: boolean;
    /**
     * Reserved for future use, currently only used for testing: this parameter can be
     * specified to control which Tiled map file is used for initializing the set of interactable areas
     *
     * Not currently used on frontend
     */
    mapFile?: string;
};

