import { INodeProperties } from 'n8n-workflow';

export const queryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['query'],
			},
		},
		options: [
			{
				name: 'Execute AQL',
				value: 'executeAql',
				description: 'Execute an ad-hoc Archetype Query Language (AQL) query',
				action: 'Execute an AQL query',
			},
			{
				name: 'Execute Stored',
				value: 'executeStored',
				description: 'Execute a stored query registered in EHRBase',
				action: 'Execute a stored query',
			},
		],
		default: 'executeAql',
	},
];

export const queryFields: INodeProperties[] = [
	// ----------------------------------
	// Query: Execute AQL
	// ----------------------------------
	{
		displayName: 'AQL Query',
		name: 'aql',
		type: 'string',
		typeOptions: {
			rows: 5,
		},
		default: 'SELECT e/ehr_id/value FROM EHR e',
		required: true,
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['executeAql'],
			},
		},
		description: 'The Archetype Query Language (AQL) query string to execute',
	},

	// ----------------------------------
	// Query: Execute Stored
	// ----------------------------------
	{
		displayName: 'Qualified Query Name',
		name: 'qualifiedQueryName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['executeStored'],
			},
		},
		placeholder: 'org.openehr::stored_query_name',
		description: 'The fully qualified name of the stored query',
	},
	{
		displayName: 'Version',
		name: 'version',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['executeStored'],
			},
		},
		placeholder: '1.0.0',
		description: 'The version of the stored query to execute (leave empty to execute the latest version)',
	},

	// ----------------------------------
	// Common Query Options
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['query'],
			},
		},
		options: [
			{
				displayName: 'Query Parameters (JSON)',
				name: 'queryParameters',
				type: 'json',
				default: '',
				description: 'Parameters to substitute in the query (e.g. {"ehr_id": "884dd000..."})',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Row number offset to start retrieving results from',
			},
			{
				displayName: 'Fetch',
				name: 'fetch',
				type: 'number',
				default: 100,
				description: 'Maximum number of rows to retrieve',
			},
		],
	},
];
