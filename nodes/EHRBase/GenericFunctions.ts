import {
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';

export async function ehrBaseApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: JsonObject = {},
	headers: JsonObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('ehrBaseApi');

	if (!credentials) {
		throw new Error('No credentials found!');
	}

	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
	const authType = credentials.authType as string;

	const requestHeaders: JsonObject = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...headers,
	};

	if (authType === 'basicAuth') {
		const username = credentials.username as string;
		const password = credentials.password as string;
		const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
		requestHeaders['Authorization'] = `Basic ${base64Credentials}`;
	} else if (authType === 'bearerToken') {
		const token = credentials.token as string;
		requestHeaders['Authorization'] = `Bearer ${token}`;
	}

	const options: IRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		headers: requestHeaders,
		qs: query,
		json: true,
	};

	if (body !== undefined && body !== null) {
		if (typeof body === 'string') {
			options.body = body;
			if (body.startsWith('<?xml') || body.includes('<template') || headers['Content-Type'] === 'application/xml') {
				requestHeaders['Content-Type'] = 'application/xml';
				options.json = false;
			}
		} else if (Object.keys(body as object).length > 0) {
			options.body = body;
		}
	}

	try {
		return await this.helpers.request(options);
	} catch (error: any) {
		throw error;
	}
}
