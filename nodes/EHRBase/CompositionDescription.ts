import { INodeProperties } from 'n8n-workflow';

export const compositionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['composition'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new composition in an EHR',
				action: 'Create a composition',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete (logical deletion) a composition',
				action: 'Delete a composition',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a composition by version UID',
				action: 'Get a composition',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing composition',
				action: 'Update a composition',
			},
		],
		default: 'create',
	},
];

export const compositionFields: INodeProperties[] = [
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
				resource: ['composition'],
			},
		},
		description: 'The EHR ID (UUID) where the composition is/will be stored',
	},

	// ----------------------------------
	// Composition: Create
	// ----------------------------------
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		options: [
			{
				name: 'Canonical JSON (Standard openEHR)',
				value: 'canonical',
				description: 'Standard openEHR Canonical JSON format',
			},
			{
				name: 'XML (Standard openEHR)',
				value: 'xml',
				description: 'Standard openEHR XML format',
			},
			{
				name: 'EHRBase FLAT JSON',
				value: 'flat',
				description: 'EHRBase Flat format (requires Template ID)',
			},
			{
				name: 'EHRBase STRUCTURED JSON',
				value: 'structured',
				description: 'EHRBase Structured format (requires Template ID)',
			},
		],
		default: 'canonical',
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update'],
			},
		},
		description: 'The serialization format of the composition payload',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update'],
				format: ['flat', 'structured'],
			},
		},
		description: 'The ID of the template used for Flat/Structured format validation',
	},
	{
		displayName: 'Composition Payload',
		name: 'compositionPayload',
		type: 'json',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update'],
			},
			hide: {
				format: ['xml'],
			},
		},
		description: 'The JSON content of the composition',
	},
	{
		displayName: 'Composition Payload (XML)',
		name: 'compositionPayloadXml',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update'],
				format: ['xml'],
			},
		},
		description: 'The XML content of the composition',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Prefer Representation',
				name: 'preferRepresentation',
				type: 'options',
				options: [
					{
						name: 'Return Representation (Return the created composition body)',
						value: 'representation',
					},
					{
						name: 'Return Minimal (Return metadata only)',
						value: 'minimal',
					},
				],
				default: 'representation',
				description: 'The client preference for what metadata/data to return',
			},
		],
	},

	// ----------------------------------
	// Composition: Get
	// ----------------------------------
	{
		displayName: 'Version UID',
		name: 'versionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['get'],
			},
		},
		description: 'The version UID of the composition to retrieve (e.g. 884dd000-0000-0000-0000-000000000000::org.openehr::1)',
	},

	// ----------------------------------
	// Composition: Update
	// ----------------------------------
	{
		displayName: 'Versioned Object UID',
		name: 'versionedObjectUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['update'],
			},
		},
		description: 'The base versioned object UID of the composition to update (e.g. 884dd000-0000-0000-0000-000000000000)',
	},
	{
		displayName: 'Preceding Version UID',
		name: 'precedingVersionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['update'],
			},
		},
		description: 'The preceding version UID of the composition (supplied in the If-Match header for concurrency control)',
	},

	// ----------------------------------
	// Composition: Delete
	// ----------------------------------
	{
		displayName: 'Preceding Version UID',
		name: 'precedingVersionUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['delete'],
			},
		},
		description: 'The exact version UID of the composition to delete (will be logically deleted by creating a deletion tombstone)',
	},
];
