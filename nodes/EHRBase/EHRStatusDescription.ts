import { INodeProperties } from 'n8n-workflow';

export const ehrStatusOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ehrStatus'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get the current EHR_STATUS for an EHR',
				action: 'Get ehr status',
			},
			{
				name: 'Get by Version',
				value: 'getByVersion',
				description: 'Get a specific version of the EHR_STATUS',
				action: 'Get ehr status by version',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update the EHR_STATUS for an EHR',
				action: 'Update ehr status',
			},
		],
		default: 'get',
	},
];

export const ehrStatusFields: INodeProperties[] = [
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
				resource: ['ehrStatus'],
			},
		},
		description: 'The EHR ID (UUID) associated with the EHR_STATUS',
	},

	// ----------------------------------
	// EHR Status: Get by Version
	// ----------------------------------
	{
		displayName: 'Version UID',
		name: 'versionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehrStatus'],
				operation: ['getByVersion'],
			},
		},
		description: 'The version UID of the EHR_STATUS to retrieve (e.g. 884dd000-0000-0000-0000-000000000000::org.openehr::1)',
	},

	// ----------------------------------
	// EHR Status: Update
	// ----------------------------------
	{
		displayName: 'Preceding Version UID',
		name: 'precedingVersionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehrStatus'],
				operation: ['update'],
			},
		},
		description: 'The preceding version UID of the EHR_STATUS (supplied in the If-Match header for concurrency control)',
	},
	{
		displayName: 'EHR Status (JSON)',
		name: 'ehrStatusJson',
		type: 'json',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['ehrStatus'],
				operation: ['update'],
			},
		},
		description: 'The new EHR_STATUS JSON object',
	},
];
