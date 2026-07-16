import { IExecuteFunctions } from 'n8n-workflow';
import { ehrbaseApiRequest } from '../transport/ehrbaseApiRequest';

export async function executeEhrStatus(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const ehrId = this.getNodeParameter('ehrId', i) as string;

	if (operation === 'get') {
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: `/ehr/${ehrId}/ehr_status`,
		});
	} else if (operation === 'getByVersion') {
		const versionUid = this.getNodeParameter('versionUid', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: `/ehr/${ehrId}/ehr_status/${versionUid}`,
		});
	} else if (operation === 'update') {
		const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
		const ehrStatusJson = this.getNodeParameter('ehrStatusJson', i) as string | object;
		const body = typeof ehrStatusJson === 'string' ? JSON.parse(ehrStatusJson) : ehrStatusJson;

		return await ehrbaseApiRequest.call(this, {
			method: 'PUT',
			endpoint: `/ehr/${ehrId}/ehr_status`,
			body,
			headers: { 'If-Match': precedingVersionUid },
			preferReturn: 'representation',
		});
	}

	throw new Error(`Unsupported EHR Status operation: ${operation}`);
}
