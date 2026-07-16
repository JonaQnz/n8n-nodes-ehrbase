import { INodeProperties } from 'n8n-workflow';

export const ehrOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new EHR, optionally with a specified EHR ID',
				action: 'Create an ehr',
			},
			{
				name: 'Ensure Exists',
				value: 'ensureExists',
				description: 'Ensure an EHR exists for a given subject (idempotent)',
				action: 'Ensure an ehr exists',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an EHR by EHR ID or by subject ID and namespace',
				action: 'Get an ehr',
			},
		],
		default: 'create',
	},
];

export const ehrFields: INodeProperties[] = [
	// ----------------------------------
	// EHR: Create
	// ----------------------------------
	{
		displayName: 'Specify EHR ID',
		name: 'specifyEhrId',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['create'],
			},
		},
		description: 'Whether to specify a custom EHR ID (UUID v4) for the new EHR',
	},
	{
		displayName: 'EHR ID',
		name: 'ehrId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['create'],
				specifyEhrId: [true],
			},
		},
		description: 'The custom UUID v4 to assign to the new EHR',
	},
	{
		displayName: 'Custom EHR Status',
		name: 'customEhrStatus',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['create'],
			},
		},
		description: 'Whether to provide a custom ehr_status payload',
	},
	{
		displayName: 'EHR Status (JSON)',
		name: 'ehrStatusJson',
		type: 'json',
		default: '',
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['create'],
				customEhrStatus: [true],
			},
		},
		description: 'The custom ehr_status JSON object containing subject, queryable, and modifiable flags',
	},

	// ----------------------------------
	// EHR: Get
	// ----------------------------------
	{
		displayName: 'Get By',
		name: 'getBy',
		type: 'options',
		options: [
			{
				name: 'EHR ID',
				value: 'ehrId',
			},
			{
				name: 'Subject ID and Namespace',
				value: 'subject',
			},
		],
		default: 'ehrId',
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'EHR ID',
		name: 'ehrId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['get'],
				getBy: ['ehrId'],
			},
		},
		description: 'The EHR ID (UUID) to retrieve',
	},
	{
		displayName: 'Subject ID',
		name: 'subjectId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['get'],
				getBy: ['subject'],
			},
		},
		description: 'The subject external ID (e.g. patient ID)',
	},
	{
		displayName: 'Subject Namespace',
		name: 'subjectNamespace',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['get'],
				getBy: ['subject'],
			},
		},
		description: 'The namespace of the subject ID (e.g. Hospital-A)',
	},

	// ----------------------------------
	// EHR: Ensure Exists
	// ----------------------------------
	{
		displayName: 'Subject ID',
		name: 'subjectId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['ensureExists'],
			},
		},
		description: 'The subject external ID (e.g. patient ID)',
	},
	{
		displayName: 'Subject Namespace',
		name: 'subjectNamespace',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehr'],
				operation: ['ensureExists'],
			},
		},
		description: 'The namespace of the subject ID (e.g. Hospital-A)',
	},
];
