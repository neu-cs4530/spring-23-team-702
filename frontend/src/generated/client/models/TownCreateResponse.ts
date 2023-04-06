/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Payload that is sent back to a client upon creating a town
 */
export type TownCreateResponse = {
    /**
     * The ID of the newly created town. This ID is needed to join the town.
     */
    townID: string;
    /**
     * An "Update password" for the newly created town. This password is needed to update or delete the town.
     */
    townUpdatePassword: string;
};

