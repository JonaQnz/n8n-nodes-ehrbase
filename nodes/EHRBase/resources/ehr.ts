import { IExecuteFunctions } from 'n8n-workflow';
import { ehrbaseApiRequest } from '../transport/ehrbaseApiRequest';

export async function executeEhr(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'create') {
		const specifyEhrId = this.getNodeParameter('specifyEhrId', i) as boolean;
		const customEhrStatus = this.getNodeParameter('customEhrStatus', i) as boolean;
		let body: any = null;

		if (customEhrStatus) {
			const ehrStatusJson = this.getNodeParameter('ehrStatusJson', i) as string | object;
			body = typeof ehrStatusJson === 'string' ? JSON.parse(ehrStatusJson) : ehrStatusJson;
		}

		if (specifyEhrId) {
			const ehrId = this.getNodeParameter('ehrId', i) as string;
			return await ehrbaseApiRequest.call(this, {
				method: 'PUT',
				endpoint: `/ehr/${ehrId}`,
				body,
				preferReturn: 'representation',
			});
		} else {
			return await ehrbaseApiRequest.call(this, {
				method: 'POST',
				endpoint: '/ehr',
				body,
				preferReturn: 'representation',
			});
		}
	} else if (operation === 'get') {
		const getBy = this.getNodeParameter('getBy', i) as string;
		if (getBy === 'ehrId') {
			const ehrId = this.getNodeParameter('ehrId', i) as string;
			return await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: `/ehr/${ehrId}`,
			});
		} else {
			const subjectId = this.getNodeParameter('subjectId', i) as string;
			const subjectNamespace = this.getNodeParameter('subjectNamespace', i) as string;
			return await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: '/ehr',
				qs: { subject_id: subjectId, subject_namespace: subjectNamespace },
			});
		}
	} else if (operation === 'ensureExists') {
		const subjectId = this.getNodeParameter('subjectId', i) as string;
		const subjectNamespace = this.getNodeParameter('subjectNamespace', i) as string;

		try {
			return await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: '/ehr',
				qs: { subject_id: subjectId, subject_namespace: subjectNamespace },
			});
		} catch (error: any) {
			if (error.httpStatusCode === 404) {
				const body = {
					_type: 'EHR_STATUS',
					subject: {
						external_ref: {
							id: {
								_type: 'GENERIC_ID',
								value: subjectId,
							},
							namespace: subjectNamespace,
							type: 'PERSON',
						},
					},
					is_queryable: true,
					is_modifiable: true,
				};
				return await ehrbaseApiRequest.call(this, {
					method: 'POST',
					endpoint: '/ehr',
					body,
					preferReturn: 'representation',
				});
			}
			throw error;
		}
	}

	throw new Error(`Unsupported EHR operation: ${operation}`);
}
