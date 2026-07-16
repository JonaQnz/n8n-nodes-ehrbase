import { IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { ehrbaseApiRequest } from '../transport/ehrbaseApiRequest';

export async function executeQuery(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const additionalOptions = this.getNodeParameter('additionalOptions', i) as JsonObject;
	const body: JsonObject = {};

	if (additionalOptions.offset !== undefined) {
		body['offset'] = additionalOptions.offset;
	}
	if (additionalOptions.fetch !== undefined) {
		body['fetch'] = additionalOptions.fetch;
	}
	if (additionalOptions.queryParameters) {
		const params = additionalOptions.queryParameters;
		body['query_parameters'] = typeof params === 'string' ? JSON.parse(params) : params;
	}

	if (operation === 'executeAql') {
		body['q'] = this.getNodeParameter('aql', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'POST',
			endpoint: '/query/aql',
			body,
		});
	} else if (operation === 'executeStored') {
		const qualifiedQueryName = this.getNodeParameter('qualifiedQueryName', i) as string;
		const version = this.getNodeParameter('version', i) as string;
		let endpoint = `/query/${qualifiedQueryName}`;
		if (version) {
			endpoint += `/${version}`;
		}
		return await ehrbaseApiRequest.call(this, {
			method: 'POST',
			endpoint,
			body,
		});
	}

	throw new Error(`Unsupported Query operation: ${operation}`);
}
