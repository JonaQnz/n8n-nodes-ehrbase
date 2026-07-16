import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';

import { ehrOperations, ehrFields } from './EHRDescription';
import { ehrStatusOperations, ehrStatusFields } from './EHRStatusDescription';
import { compositionOperations, compositionFields } from './CompositionDescription';
import { directoryOperations, directoryFields } from './DirectoryDescription';
import { queryOperations, queryFields } from './QueryDescription';
import { definitionOperations, definitionFields } from './DefinitionDescription';

import { executeEhr } from './resources/ehr';
import { executeEhrStatus } from './resources/ehrStatus';
import { executeComposition } from './resources/composition';
import { executeDirectory } from './resources/directory';
import { executeQuery } from './resources/query';
import { executeDefinition } from './resources/definition';
import { ehrbaseApiRequest } from './transport/ehrbaseApiRequest';
import { normalizeResponse } from './helpers/response';

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

	methods = {
		loadOptions: {
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const responseData = await ehrbaseApiRequest.call(this, {
					method: 'GET',
					endpoint: '/definition/template/adl1.4',
				});
				const returnData: INodePropertyOptions[] = [];
				if (Array.isArray(responseData)) {
					for (const template of responseData) {
						returnData.push({
							name: template.concept || template.template_id,
							value: template.template_id,
						});
					}
				}
				return returnData;
			},
		},
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
					responseData = await executeEhr.call(this, operation, i);
				} else if (resource === 'ehrStatus') {
					responseData = await executeEhrStatus.call(this, operation, i);
				} else if (resource === 'composition') {
					responseData = await executeComposition.call(this, operation, i);
				} else if (resource === 'directory') {
					responseData = await executeDirectory.call(this, operation, i);
				} else if (resource === 'query') {
					responseData = await executeQuery.call(this, operation, i);
				} else if (resource === 'definition') {
					responseData = await executeDefinition.call(this, operation, i);
				}

				let outputFormat = 'raw';
				try {
					const additionalOptions = this.getNodeParameter('options', i, {}) as JsonObject;
					outputFormat = (additionalOptions.outputFormat as string) || 'raw';
				} catch (e) {}

				const normalized = normalizeResponse(responseData, outputFormat);
				const executionData = this.helpers.returnJsonArray(normalized as JsonObject);
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
