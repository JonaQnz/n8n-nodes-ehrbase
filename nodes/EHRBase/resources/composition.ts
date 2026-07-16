import { IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { ehrbaseApiRequest, EhrbaseRequestOptions } from '../transport/ehrbaseApiRequest';
import { parseVersionUid } from '../helpers/identifiers';

export async function executeComposition(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'commitRecord') {
		const subjectId = this.getNodeParameter('subjectId', i) as string;
		const subjectNamespace = this.getNodeParameter('subjectNamespace', i) as string;

		// 1. Ensure EHR Exists
		let resolvedEhrId = '';
		try {
			const ehrRes = await ehrbaseApiRequest.call(this, {
				method: 'GET',
				endpoint: '/ehr',
				qs: { subject_id: subjectId, subject_namespace: subjectNamespace },
			});
			resolvedEhrId = ehrRes.ehr_id.value;
		} catch (error: any) {
			if (error.httpStatusCode === 404) {
				const body = {
					_type: 'EHR_STATUS',
					subject: {
						external_ref: { id: { _type: 'GENERIC_ID', value: subjectId }, namespace: subjectNamespace, type: 'PERSON' },
					},
					is_queryable: true,
					is_modifiable: true,
				};
				const createRes = await ehrbaseApiRequest.call(this, {
					method: 'POST',
					endpoint: '/ehr',
					body,
					preferReturn: 'representation',
				});
				resolvedEhrId = createRes.ehr_id.value;
			} else {
				throw error;
			}
		}

		// 2. Write Composition
		const format = this.getNodeParameter('format', i) as string;
		let body: any;
		const isXml = format === 'xml';
		const options: EhrbaseRequestOptions = {
			method: 'POST',
			endpoint: `/ehr/${resolvedEhrId}/composition`,
			format: isXml ? 'canonicalXml' : (format as 'flat' | 'structured' | 'canonicalJson'),
			qs: {},
			headers: {},
		};

		if (isXml) {
			body = this.getNodeParameter('compositionPayloadXml', i) as string;
		} else {
			const payload = this.getNodeParameter('compositionPayload', i) as string | object;
			body = typeof payload === 'string' ? JSON.parse(payload) : payload;

			if (format === 'flat' || format === 'structured') {
				options.qs!.templateId = this.getNodeParameter('templateId', i) as string;
			}
		}
		options.body = body;
		options.preferReturn = 'representation';

		return await ehrbaseApiRequest.call(this, options);
	}

	const ehrId = this.getNodeParameter('ehrId', i) as string;

	if (operation === 'create' || operation === 'update' || operation === 'createOrUpdate') {
		const format = this.getNodeParameter('format', i) as string;
		let body: any;
		const isXml = format === 'xml';
		const options: EhrbaseRequestOptions = {
			method: 'POST',
			endpoint: `/ehr/${ehrId}/composition`,
			format: isXml ? 'canonicalXml' : (format as 'flat' | 'structured' | 'canonicalJson'),
			qs: {},
			headers: {},
		};

		if (isXml) {
			body = this.getNodeParameter('compositionPayloadXml', i) as string;
		} else {
			const payload = this.getNodeParameter('compositionPayload', i) as string | object;
			body = typeof payload === 'string' ? JSON.parse(payload) : payload;

			if (format === 'flat' || format === 'structured') {
				options.qs!.templateId = this.getNodeParameter('templateId', i) as string;
			}
		}
		options.body = body;

		const additionalOptions = this.getNodeParameter('options', i, {}) as JsonObject;
		if (additionalOptions.preferRepresentation) {
			options.preferReturn = additionalOptions.preferRepresentation as 'minimal' | 'representation';
		}

		let actualOperation = operation;
		let updateVersionedObjectUid = '';
		let updatePrecedingVersionUid = '';

		if (operation === 'createOrUpdate') {
			const versionUid = this.getNodeParameter('versionUid', i, '') as string;
			if (versionUid) {
				actualOperation = 'update';
				updatePrecedingVersionUid = versionUid;
				const parsedUid = parseVersionUid(versionUid);
				updateVersionedObjectUid = parsedUid.objectId;
			} else {
				actualOperation = 'create';
			}
		} else if (operation === 'update') {
			updateVersionedObjectUid = this.getNodeParameter('versionedObjectUid', i) as string;
			updatePrecedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
		}

		if (actualOperation === 'create') {
			options.method = 'POST';
			return await ehrbaseApiRequest.call(this, options);
		} else {
			options.method = 'PUT';
			options.endpoint = `/ehr/${ehrId}/composition/${updateVersionedObjectUid}`;
			options.headers = { 'If-Match': updatePrecedingVersionUid };
			return await ehrbaseApiRequest.call(this, options);
		}
	} else if (operation === 'get') {
		const versionUid = this.getNodeParameter('versionUid', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: `/ehr/${ehrId}/composition/${versionUid}`,
		});
	} else if (operation === 'delete') {
		const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'DELETE',
			endpoint: `/ehr/${ehrId}/composition/${precedingVersionUid}`,
		});
	}

	throw new Error(`Unsupported Composition operation: ${operation}`);
}
