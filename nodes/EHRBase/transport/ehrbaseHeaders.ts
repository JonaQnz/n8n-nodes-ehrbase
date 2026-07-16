import { EhrbaseRequestOptions } from './ehrbaseApiRequest';

export function createEhrbaseHeaders(options: EhrbaseRequestOptions): Record<string, string> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		...options.headers,
	};

	if (options.format === 'canonicalXml') {
		headers['Content-Type'] = 'application/xml';
		headers['Accept'] = 'application/xml';
	}

	if (options.preferReturn) {
		headers['Prefer'] = `return=${options.preferReturn}`;
	}

	return headers;
}
