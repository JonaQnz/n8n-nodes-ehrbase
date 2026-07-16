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
				name: 'Commit Record',
				value: 'commitRecord',
				description: 'High-level helper to write a composition based on Subject ID/Namespace',
				action: 'Commit a clinical record',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new composition in an EHR',
				action: 'Create a composition',
			},
			{
				name: 'Create or Update',
				value: 'createOrUpdate',
				description: 'Create a new composition, or update an existing one if a Version UID is provided',
				action: 'Create or update a composition',
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
			hide: {
				operation: ['commitRecord'],
			},
		},
		description: 'The EHR ID (UUID) where the composition is/will be stored',
	},

	// ----------------------------------
	// Composition: Commit Record
	// ----------------------------------
	{
		displayName: 'Subject ID',
		name: 'subjectId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['commitRecord'],
			},
		},
		description: 'The ID of the subject (e.g. Patient ID)',
	},
	{
		displayName: 'Subject Namespace',
		name: 'subjectNamespace',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['commitRecord'],
			},
		},
		description: 'The namespace of the subject ID (e.g. your system namespace)',
	},

	// ----------------------------------
	// Composition: Create / Update / CreateOrUpdate / CommitRecord
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
				name: 'EHRBase FLAT JSON',
				value: 'flat',
				description: 'EHRBase Flat format (requires Template ID)',
			},
			{
				name: 'EHRBase STRUCTURED JSON',
				value: 'structured',
				description: 'EHRBase Structured format (requires Template ID)',
			},
			{
				name: 'XML (Standard openEHR)',
				value: 'xml',
				description: 'Standard openEHR XML format',
			},
		],
		default: 'canonical',
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update', 'createOrUpdate', 'commitRecord'],
			},
		},
		description: 'The serialization format of the composition payload',
	},
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTemplates',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['create', 'update', 'createOrUpdate', 'commitRecord'],
				format: ['flat', 'structured'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
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
				operation: ['create', 'update', 'createOrUpdate', 'commitRecord'],
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
				operation: ['create', 'update', 'createOrUpdate', 'commitRecord'],
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
				operation: ['create', 'update', 'createOrUpdate'], // CommitRecord handles preferRepresentation implicitly
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
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Raw',
						value: 'raw',
						description: 'Return the raw response from EHRbase',
					},
					{
						name: 'Simplified',
						value: 'simplified',
						description: 'Simplify the response by flattening values',
					},
				],
				default: 'raw',
				description: 'Whether to return raw EHRbase structure or a simplified version',
			},
		],
	},

	// ----------------------------------
	// Composition: Create or Update
	// ----------------------------------
	{
		displayName: 'Version UID',
		name: 'versionUid',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['composition'],
				operation: ['createOrUpdate'],
			},
		},
		description: 'If provided, the composition will be updated. If empty, it will be created. (e.g. 884dd000-0000-0000-0000-000000000000::org.openehr::1)',
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
