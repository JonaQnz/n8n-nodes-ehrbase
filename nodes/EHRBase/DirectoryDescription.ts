import { INodeProperties } from 'n8n-workflow';

export const directoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['directory'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new directory structure in an EHR',
				action: 'Create a directory',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete directory structure from an EHR',
				action: 'Delete a directory',
			},
			{
				name: 'Get or Create',
				value: 'getOrCreate',
				description: 'Get the directory structure, or create a default root if it does not exist',
				action: 'Get or create a directory',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get the directory structure of an EHR',
				action: 'Get a directory',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update the directory structure of an EHR',
				action: 'Update a directory',
			},
		],
		default: 'get',
	},
];

export const directoryFields: INodeProperties[] = [
	// ----------------------------------
	// Common Fields
	// ----------------------------------
	{
		displayName: 'EHR ID',
		name: 'ehrId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
			},
		},
		description: 'The EHR ID (UUID) associated with the directory',
	},

	// ----------------------------------
	// Directory: Get
	// ----------------------------------
	{
		displayName: 'Specify Version UID',
		name: 'specifyVersionUid',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['get'],
			},
		},
		description: 'Whether to retrieve a specific version of the directory',
	},
	{
		displayName: 'Version UID',
		name: 'versionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['get'],
				specifyVersionUid: [true],
			},
		},
		description: 'The version UID of the directory to retrieve (e.g. 884dd000-0000-0000-0000-000000000000::org.openehr::1)',
	},

	// ----------------------------------
	// Directory: Create / Update
	// ----------------------------------
	{
		displayName: 'Directory Payload (JSON)',
		name: 'directoryPayload',
		type: 'json',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['create', 'update', 'getOrCreate'],
			},
		},
		description: 'The FOLDER structure JSON object representing the directory',
	},

	// ----------------------------------
	// Directory: Update / Delete
	// ----------------------------------
	{
		displayName: 'Preceding Version UID',
		name: 'precedingVersionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['directory'],
				operation: ['update', 'delete'],
			},
		},
		description: 'The preceding version UID of the directory (supplied in the If-Match header for concurrency control)',
	},
];
