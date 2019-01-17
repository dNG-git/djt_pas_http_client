/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;pas;http_client
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

import { Exception } from 'djt-app';

import { ApiClientFactory } from './api-client-factory';

/**
 * HTTP JSON-encoded REST client for the Python Application Services CRUD
 * API.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-pas-http-client
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export class CrudClient {
    /**
     * CRUD entity name
     */
    protected entity: string;
    /**
     * Initialized HTTP API client factory
     */
    protected apiClientFactory: ApiClientFactory;

    /**
     * Constructor (CrudClient)
     *
     * @param apiBaseUrl API base URL used for the factory
     * @param entity CRUD entity name
     * @param requestedVersion Version expected to be supported by the server
     * @param timeout Default timeout for API requests
     *
     * @since v1.0.0
     */
    constructor(apiBaseUrl: string, entity: string, requestedVersion?: string, timeout?: number) {
        this.entity = encodeURIComponent(entity);
        this.apiClientFactory = new ApiClientFactory(apiBaseUrl, 'crud', requestedVersion, timeout);
    }

    /**
     * Creates a new entry for the given sub-path CRUD resource.
     *
     * @param subPath Sub-path CRUD resource
     * @param data Entry attributes
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async create(subPath?: string | string[], data?: unknown) {
        const httpClient = await this.apiClientFactory.createVerifiedClient(this.getEndpointFromSubPath(subPath));
        return this.handleResponse(await httpClient.requestPost(data));
    }

    /**
     * Executes a given sub-path CRUD resource.
     *
     * @param subPath Sub-path CRUD resource
     * @param data Resource data
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async execute(subPath?: string | string[], data?: unknown) {
        const httpClient = await this.apiClientFactory.createVerifiedClient(this.getEndpointFromSubPath(subPath));
        return this.handleResponse(await httpClient.requestPost(data));
    }

    /**
     * Returns the given sub-path CRUD resource entry.
     *
     * @param subPath Sub-path CRUD resource
     * @param data CRUD resource specific attributes
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async get(subPath?: string | string[], data?: unknown) {
        const httpClient = await this.apiClientFactory.createVerifiedClient(this.getEndpointFromSubPath(subPath));
        return this.handleResponse(await httpClient.requestGet(data));
    }

    /**
     * Returns the CRUD endpoint for the path given.
     *
     * @param subPath Sub-path CRUD resource
     *
     * @return CRUD endpoint
     * @since  v1.0.0
     */
    protected getEndpointFromSubPath(subPath?: string | string[]) {
        if (!Array.isArray(subPath)) {
            subPath = (typeof subPath == 'string' ? [ subPath ] : [ ]);
        }

        subPath.unshift(this.entity);

        subPath = subPath.map((path) => {
            return path.replace(/([A-Z]+|[a-z0-9])([A-Z])(?!$)/, '$1_$2').toLowerCase();
        });

        subPath.unshift('apis', 'pas', 'crud');

        return subPath.join('/');
    }

    /**
     * Handles the given response object and throws exceptions if not valid.
     *
     * @param response Response data; 'body' may contain the catched exception
     *
     * @return Response data
     * @since  v1.0.0
     */
    // tslint:disable-next-line:no-any
    protected handleResponse(response: any) {
        if (response.body instanceof Error) {
            throw response.body;
        } else if ('error' in response.body && Object.keys(response.body).length == 1) {
            throw new Exception(response.body.error.message, "CRUD_ERROR");
        }

        return response.body;
    }

    /**
     * Checks if the given sub-path CRUD resource is valid.
     *
     * @param subPath Sub-path CRUD resource
     * @param data CRUD resource specific attributes
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async isValid(subPath?: string | string[], data?: unknown) {
        const httpClient = await this.apiClientFactory.createVerifiedClient(this.getEndpointFromSubPath(subPath));
        let _return = this.handleResponse(await httpClient.requestHead(data));

        if ('success' in _return && typeof _return.success == 'boolean') {
            _return = _return.success;
        }

        return _return;
    }

    /**
     * Updates the given sub-path CRUD resource entry.
     *
     * @param subPath Sub-path CRUD resource
     * @param data Entry attributes
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async update(subPath?: string | string[], data?: unknown) {
        const httpClient = await this.apiClientFactory.createVerifiedClient(this.getEndpointFromSubPath(subPath));
        return this.handleResponse(await httpClient.requestPatch(data));
    }

    /**
     * Upserts the given sub-path CRUD resource entry.
     *
     * @param subPath Sub-path CRUD resource
     * @param data Entry attributes
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async upsert(subPath?: string | string[], data?: unknown) {
        const httpClient = await this.apiClientFactory.createVerifiedClient(this.getEndpointFromSubPath(subPath));
        return this.handleResponse(await httpClient.requestPut(data));
    }
}
