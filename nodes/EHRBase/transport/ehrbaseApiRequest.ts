import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { createEhrbaseHeaders } from './ehrbaseHeaders';
import { handleEhrbaseError } from './ehrbaseErrors';

export interface EhrbaseRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: unknown;
	qs?: Record<string, string | number | boolean | undefined>;
	format?: 'canonicalJson' | 'canonicalXml' | 'flat' | 'structured';
	preferReturn?: 'minimal' | 'representation';
	headers?: Record<string, string>;
}

export async function ehrbaseApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	options: EhrbaseRequestOptions,
): Promise<any> {
	// Construct headers using the dedicated helper function
	const requestHeaders = createEhrbaseHeaders(options);

	// Determine if body is JSON based on headers or body type
	let isJson = true;
	let parsedBody: any = options.body;

	if (options.body !== undefined && options.body !== null) {
		if (typeof options.body === 'string') {
			if (options.body.startsWith('<?xml') || options.body.includes('<template') || requestHeaders['Content-Type'] === 'application/xml') {
				requestHeaders['Content-Type'] = 'application/xml';
				isJson = false;
			}
		}
	}

	// Prepare qs, omitting undefined values
	const query: JsonObject = {};
	if (options.qs) {
		for (const [key, value] of Object.entries(options.qs)) {
			if (value !== undefined) {
				query[key] = value as string | number | boolean;
			}
		}
	}
	
	if (options.format === 'flat' || options.format === 'structured') {
		query['format'] = options.format.toUpperCase();
	}

	const requestOptions: any = { // Use any to bypass strict type checking for IRequestOptions
		method: options.method,
		url: options.endpoint,
		headers: requestHeaders,
		qs: query,
		json: isJson,
		body: parsedBody,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'ehrBaseApi',
			requestOptions,
		);
	} catch (error: any) {
		throw handleEhrbaseError(error);
	}
}
