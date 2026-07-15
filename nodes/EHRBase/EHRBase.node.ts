import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';

import { ehrBaseApiRequest } from './GenericFunctions';
import { ehrOperations, ehrFields } from './EHRDescription';
import { ehrStatusOperations, ehrStatusFields } from './EHRStatusDescription';
import { compositionOperations, compositionFields } from './CompositionDescription';
import { directoryOperations, directoryFields } from './DirectoryDescription';
import { queryOperations, queryFields } from './QueryDescription';
import { definitionOperations, definitionFields } from './DefinitionDescription';

export class EHRBase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EHRBase',
		name: 'ehrBase',
		icon: 'file:ehrbase.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with EHRBase (openEHR) server APIs',
		defaults: {
			name: 'EHRBase',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'ehrBaseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'EHR',
						value: 'ehr',
					},
					{
						name: 'EHR Status',
						value: 'ehrStatus',
					},
					{
						name: 'Composition',
						value: 'composition',
					},
					{
						name: 'Directory',
						value: 'directory',
					},
					{
						name: 'Query (AQL)',
						value: 'query',
					},
					{
						name: 'Definition (Template/Archetype)',
						value: 'definition',
					},
				],
				default: 'ehr',
			},

			// Operations
			...ehrOperations,
			...ehrStatusOperations,
			...compositionOperations,
			...directoryOperations,
			...queryOperations,
			...definitionOperations,

			// Fields
			...ehrFields,
			...ehrStatusFields,
			...compositionFields,
			...directoryFields,
			...queryFields,
			...definitionFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		for (let i = 0; i < length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				if (resource === 'ehr') {
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
							responseData = await ehrBaseApiRequest.call(
								this,
								'PUT',
								`/ehr/${ehrId}`,
								body,
								{},
								{ 'Prefer': 'return=representation' }
							);
						} else {
							responseData = await ehrBaseApiRequest.call(
								this,
								'POST',
								'/ehr',
								body,
								{},
								{ 'Prefer': 'return=representation' }
							);
						}
					} else if (operation === 'get') {
						const getBy = this.getNodeParameter('getBy', i) as string;
						if (getBy === 'ehrId') {
							const ehrId = this.getNodeParameter('ehrId', i) as string;
							responseData = await ehrBaseApiRequest.call(this, 'GET', `/ehr/${ehrId}`);
						} else {
							const subjectId = this.getNodeParameter('subjectId', i) as string;
							const subjectNamespace = this.getNodeParameter('subjectNamespace', i) as string;
							responseData = await ehrBaseApiRequest.call(
								this,
								'GET',
								'/ehr',
								null,
								{ subject_id: subjectId, subject_namespace: subjectNamespace }
							);
						}
					}
				} else if (resource === 'ehrStatus') {
					const ehrId = this.getNodeParameter('ehrId', i) as string;

					if (operation === 'get') {
						responseData = await ehrBaseApiRequest.call(this, 'GET', `/ehr/${ehrId}/ehr_status`);
					} else if (operation === 'getByVersion') {
						const versionUid = this.getNodeParameter('versionUid', i) as string;
						responseData = await ehrBaseApiRequest.call(this, 'GET', `/ehr/${ehrId}/ehr_status/${versionUid}`);
					} else if (operation === 'update') {
						const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
						const ehrStatusJson = this.getNodeParameter('ehrStatusJson', i) as string | object;
						const body = typeof ehrStatusJson === 'string' ? JSON.parse(ehrStatusJson) : ehrStatusJson;

						responseData = await ehrBaseApiRequest.call(
							this,
							'PUT',
							`/ehr/${ehrId}/ehr_status`,
							body,
							{},
							{ 
								'If-Match': precedingVersionUid,
								'Prefer': 'return=representation'
							}
						);
					}
				} else if (resource === 'composition') {
					const ehrId = this.getNodeParameter('ehrId', i) as string;

					if (operation === 'create' || operation === 'update') {
						const format = this.getNodeParameter('format', i) as string;
						let body: any;
						const headers: JsonObject = {};
						const query: JsonObject = {};

						if (format === 'xml') {
							body = this.getNodeParameter('compositionPayloadXml', i) as string;
							headers['Content-Type'] = 'application/xml';
							headers['Accept'] = 'application/xml';
						} else {
							const payload = this.getNodeParameter('compositionPayload', i) as string | object;
							body = typeof payload === 'string' ? JSON.parse(payload) : payload;
							headers['Content-Type'] = 'application/json';
							headers['Accept'] = 'application/json';

							if (format === 'flat' || format === 'structured') {
								query['format'] = format.toUpperCase();
								query['templateId'] = this.getNodeParameter('templateId', i) as string;
							}
						}

						if (operation === 'create') {
							const options = this.getNodeParameter('options', i) as JsonObject;
							if (options.preferRepresentation) {
								headers['Prefer'] = `return=${options.preferRepresentation}`;
							}
							responseData = await ehrBaseApiRequest.call(
								this,
								'POST',
								`/ehr/${ehrId}/composition`,
								body,
								query,
								headers
							);
						} else {
							const versionedObjectUid = this.getNodeParameter('versionedObjectUid', i) as string;
							const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
							headers['If-Match'] = precedingVersionUid;

							const options = this.getNodeParameter('options', i) as JsonObject;
							if (options && options.preferRepresentation) {
								headers['Prefer'] = `return=${options.preferRepresentation}`;
							}

							responseData = await ehrBaseApiRequest.call(
								this,
								'PUT',
								`/ehr/${ehrId}/composition/${versionedObjectUid}`,
								body,
								query,
								headers
							);
						}
					} else if (operation === 'get') {
						const versionUid = this.getNodeParameter('versionUid', i) as string;
						responseData = await ehrBaseApiRequest.call(this, 'GET', `/ehr/${ehrId}/composition/${versionUid}`);
					} else if (operation === 'delete') {
						const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
						responseData = await ehrBaseApiRequest.call(
							this,
							'DELETE',
							`/ehr/${ehrId}/composition/${precedingVersionUid}`
						);
					}
				} else if (resource === 'directory') {
					const ehrId = this.getNodeParameter('ehrId', i) as string;

					if (operation === 'create') {
						const payload = this.getNodeParameter('directoryPayload', i) as string | object;
						const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
						responseData = await ehrBaseApiRequest.call(
							this,
							'POST',
							`/ehr/${ehrId}/directory`,
							body,
							{},
							{ 'Prefer': 'return=representation' }
						);
					} else if (operation === 'get') {
						const specifyVersionUid = this.getNodeParameter('specifyVersionUid', i) as boolean;
						if (specifyVersionUid) {
							const versionUid = this.getNodeParameter('versionUid', i) as string;
							responseData = await ehrBaseApiRequest.call(this, 'GET', `/ehr/${ehrId}/directory/${versionUid}`);
						} else {
							responseData = await ehrBaseApiRequest.call(this, 'GET', `/ehr/${ehrId}/directory`);
						}
					} else if (operation === 'update') {
						const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
						const payload = this.getNodeParameter('directoryPayload', i) as string | object;
						const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
						responseData = await ehrBaseApiRequest.call(
							this,
							'PUT',
							`/ehr/${ehrId}/directory`,
							body,
							{},
							{
								'If-Match': precedingVersionUid,
								'Prefer': 'return=representation',
							}
						);
					} else if (operation === 'delete') {
						const precedingVersionUid = this.getNodeParameter('precedingVersionUid', i) as string;
						responseData = await ehrBaseApiRequest.call(
							this,
							'DELETE',
							`/ehr/${ehrId}/directory`,
							null,
							{},
							{ 'If-Match': precedingVersionUid }
						);
					}
				} else if (resource === 'query') {
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
						responseData = await ehrBaseApiRequest.call(this, 'POST', '/query/aql', body);
					} else if (operation === 'executeStored') {
						const qualifiedQueryName = this.getNodeParameter('qualifiedQueryName', i) as string;
						const version = this.getNodeParameter('version', i) as string;
						let endpoint = `/query/${qualifiedQueryName}`;
						if (version) {
							endpoint += `/${version}`;
						}
						responseData = await ehrBaseApiRequest.call(this, 'POST', endpoint, body);
					}
				} else if (resource === 'definition') {
					if (operation === 'listTemplates') {
						responseData = await ehrBaseApiRequest.call(this, 'GET', '/definition/template/adl1.4');
					} else if (operation === 'getTemplate') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						responseData = await ehrBaseApiRequest.call(this, 'GET', `/definition/template/adl1.4/${templateId}`);
					} else if (operation === 'listArchetypes') {
						responseData = await ehrBaseApiRequest.call(this, 'GET', '/definition/archetype');
					} else if (operation === 'getArchetype') {
						const archetypeId = this.getNodeParameter('archetypeId', i) as string;
						responseData = await ehrBaseApiRequest.call(this, 'GET', `/definition/archetype/${archetypeId}`);
					} else if (operation === 'uploadTemplate') {
						const sourceType = this.getNodeParameter('sourceType', i) as string;
						let body: string;

						if (sourceType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
							const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							body = buffer.toString('utf8');
						} else {
							body = this.getNodeParameter('templateXml', i) as string;
						}

						responseData = await ehrBaseApiRequest.call(
							this,
							'POST',
							'/definition/template/adl1.4',
							body,
							{},
							{ 'Content-Type': 'application/xml', 'Accept': 'application/xml' }
						);
					}
				}

				const executionData = this.helpers.returnJsonArray(responseData as JsonObject);
				returnData.push(...executionData);
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
