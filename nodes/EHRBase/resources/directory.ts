import { IExecuteFunctions } from 'n8n-workflow';
import { ehrbaseApiRequest } from '../transport/ehrbaseApiRequest';

export async function executeDirectory(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const ehrId = this.getNodeParameter('ehrId', i) as string;

	if (operation === 'create') {
		const payload = this.getNodeParameter('directoryPayload', i) as string | object;
		const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
		return await ehrbaseApiRequest.call(this, {
			method: 'POST',
			endpoint: `/ehr/${ehrId}/directory`,
			body,
			preferReturn: 'representation',
		});
	} else if (operation === 'get') {
		const specifyVersionUid = this.getNodeParameter('specifyVersionUid', i) as boolean;
		if (specifyVersionUid) {
			const versionUid = this.getNodeParameter('versionUid', i) as string;
			return await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: `/ehr/${ehrId}/directory/${versionUid}`,
			});
		} else {
			return await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: `/ehr/${ehrId}/directory`,
			});
		}
	} else if (operation === 'update') {
		const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
		const payload = this.getNodeParameter('directoryPayload', i) as string | object;
		const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
		return await ehrbaseApiRequest.call(this, {
			method: 'PUT',
			endpoint: `/ehr/${ehrId}/directory`,
			body,
			headers: { 'If-Match': precedingVersionUid },
			preferReturn: 'representation',
		});
	} else if (operation === 'delete') {
		const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'DELETE',
			endpoint: `/ehr/${ehrId}/directory`,
			headers: { 'If-Match': precedingVersionUid },
		});
	} else if (operation === 'getOrCreate') {
		try {
			return await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: `/ehr/${ehrId}/directory`,
			});
		} catch (error: any) {
			if (error.httpStatusCode === 404) {
				const payload = this.getNodeParameter('directoryPayload', i, {
					_type: 'FOLDER',
					name: { _type: 'DV_TEXT', value: 'root' },
					archetype_node_id: 'openEHR-EHR-FOLDER.generic.v1'
				}) as string | object;
				const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
				return await ehrbaseApiRequest.call(this, {
					method: 'POST',
					endpoint: `/ehr/${ehrId}/directory`,
					body,
					preferReturn: 'representation',
				});
			}
			throw error;
		}
	}

	throw new Error(`Unsupported Directory operation: ${operation}`);
}
