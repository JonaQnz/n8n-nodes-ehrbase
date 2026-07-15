import { INodeProperties } from 'n8n-workflow';

export const definitionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['definition'],
			},
		},
		options: [
			{
				name: 'Get Archetype',
				value: 'getArchetype',
				description: 'Get an archetype by ID',
				action: 'Get an archetype',
			},
			{
				name: 'Get Template',
				value: 'getTemplate',
				description: 'Get a template (ADL 1.4) by ID',
				action: 'Get a template',
			},
			{
				name: 'List Archetypes',
				value: 'listArchetypes',
				description: 'List all archetypes registered in EHRBase',
				action: 'List archetypes',
			},
			{
				name: 'List Templates',
				value: 'listTemplates',
				description: 'List all templates (ADL 1.4) registered in EHRBase',
				action: 'List templates',
			},
			{
				name: 'Upload Template',
				value: 'uploadTemplate',
				description: 'Upload a template (ADL 1.4 XML / OPT) to EHRBase',
				action: 'Upload a template',
			},
		],
		default: 'listTemplates',
	},
];

export const definitionFields: INodeProperties[] = [
	// ----------------------------------
	// Definition: Get Archetype
	// ----------------------------------
	{
		displayName: 'Archetype ID',
		name: 'archetypeId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['definition'],
				operation: ['getArchetype'],
			},
		},
		placeholder: 'openEHR-EHR-OBSERVATION.blood_pressure.v1',
		description: 'The ID of the archetype to retrieve',
	},

	// ----------------------------------
	// Definition: Get Template
	// ----------------------------------
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['definition'],
				operation: ['getTemplate'],
			},
		},
		placeholder: 'IDCR - Adverse Reaction List.v1',
		description: 'The ID of the template to retrieve',
	},

	// ----------------------------------
	// Definition: Upload Template
	// ----------------------------------
	{
		displayName: 'Source Type',
		name: 'sourceType',
		type: 'options',
		options: [
			{
				name: 'String (Raw XML)',
				value: 'string',
			},
			{
				name: 'Binary File',
				value: 'binary',
			},
		],
		default: 'string',
		displayOptions: {
			show: {
				resource: ['definition'],
				operation: ['uploadTemplate'],
			},
		},
	},
	{
		displayName: 'Template XML',
		name: 'templateXml',
		type: 'string',
		typeOptions: {
			rows: 8,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['definition'],
				operation: ['uploadTemplate'],
				sourceType: ['string'],
			},
		},
		description: 'The raw XML content of the ADL 1.4 operational template (.opt)',
	},
	{
		displayName: 'Input Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['definition'],
				operation: ['uploadTemplate'],
				sourceType: ['binary'],
			},
		},
		description: 'Name of the binary property from which to load the ADL 1.4 template (.opt file)',
	},
];
