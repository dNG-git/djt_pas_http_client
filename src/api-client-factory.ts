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

import { HttpJsonClient } from 'djt-http-client';

/**
 * The "ApiClientFactory" provides methods to create pre-configured HTTP
 * JSON clients.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-pas-http-client
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export class ApiClientFactory {
    /**
     * Timeout in seconds before API config requests fail
     */
    protected static readonly API_CONFIG_REQUEST_TIMEOUT = 5;
    /**
     * API namespace configurations
     */
    protected static configs: any = { };

    /**
     * Base URL to the server API implementation
     */
    protected apiBaseUrl: string;
    /**
     * Python Application Services API namespace to use
     */
    protected apiNamespace: string;
    /**
     *  Version expected to be supported by the server
     */
    protected requestedVersion: string | undefined;
    /**
     * Default timeout for API requests
     */
    protected timeout: number;

    /**
     * Constructor (ApiClientFactory)
     *
     * @param apiBaseUrl API base URL used for the factory
     * @param apiNamespace API namespace used for version verification
     * @param requestedVersion Version expected to be supported by the server
     * @param timeout Default timeout for API requests
     *
     * @since v1.0.0
     */
    constructor(apiBaseUrl: string, apiNamespace: string, requestedVersion?: string, timeout = 30) {
        this.apiBaseUrl = apiBaseUrl;
        this.apiNamespace = encodeURIComponent(apiNamespace);
        this.requestedVersion = requestedVersion;
        this.timeout = timeout;

        if (!apiBaseUrl.endsWith('/')) {
            this.apiBaseUrl += '/';
        }
    }

    /**
     * Returns the corresponding class of the calling instance.
     *
     * @return Class object
     * @since  v1.0.0
     */
    protected get instanceClass() {
        return Object.getPrototypeOf(this).constructor;
    }

    /**
     * Returns true if the version requested is supported by the server.
     *
     * @return Promise instance returning true if the version requested is
     *         supported by the server
     * @since  v1.0.0
     */
    public get isVersionSupported() {
        return this.getConfig().then((config) => {
            return (config.version_supported === this.requestedVersion);
        });
    }

    /**
     * Returns the API namespace config
     *
     * @return Response data
     * @since  v1.0.0
     */
    public async getConfig() {
        const configs = this.instanceClass.configs;

        if (!(this.apiNamespace in configs)) {
            const httpClient = new HttpJsonClient(
                `${this.apiBaseUrl}.well-known/pas-${this.apiNamespace}-api/config`,
                this.instanceClass.API_CONFIG_REQUEST_TIMEOUT
            );

            let result;

            if (this.requestedVersion !== undefined) {
                // tslint:disable-next-line:no-any
                const params: any = { };
                params[`${this.apiNamespace}_version`] = this.requestedVersion;

                result = await httpClient.requestPost(params);
            } else {
                result = await httpClient.requestGet();
            }

            if (result.body instanceof Error) {
                throw result.body;
            }

            configs[this.apiNamespace] = result.body;
        }

        return configs[this.apiNamespace];
    }

    /**
     * Creates a new API client instance for the endpoint without validating
     * the if the version requested is supported by the server.
     *
     * @return HTTP JSON client instance
     * @since  v1.0.0
     */
    public createClient(endpointPath: string) {
        if (endpointPath.startsWith('/')) {
            endpointPath = endpointPath.slice(1);
        }

        return new HttpJsonClient(this.apiBaseUrl + endpointPath, this.timeout);
    }

    /**
     * Creates a new API client instance for the endpoint.
     *
     * @return HTTP JSON client instance
     */
    public async createVerifiedClient(endpointPath: string) {
        if (!await this.isVersionSupported) {
            throw new Error('APP_VERSION_NOT_SUPPORTED');
        }

        return this.createClient(endpointPath);
    }
}
