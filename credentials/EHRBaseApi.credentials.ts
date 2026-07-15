import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EHRBaseApi implements ICredentialType {
	name = 'ehrBaseApi';
	displayName = 'EHRBase API';
	documentationUrl = 'https://docs.ehrbase.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8080/ehrbase/rest/openehr/v1',
			placeholder: 'http://localhost:8080/ehrbase/rest/openehr/v1',
			required: true,
			description: 'The base URL of the EHRBase openEHR REST API (e.g., http://localhost:8080/ehrbase/rest/openehr/v1)',
		},
		{
			displayName: 'Authentication',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'None',
					value: 'none',
				},
				{
					name: 'Basic Auth',
					value: 'basicAuth',
				},
				{
					name: 'Bearer Token',
					value: 'bearerToken',
				},
			],
			default: 'none',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			displayOptions: {
				show: {
					authType: [
						'basicAuth',
					],
				},
			},
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authType: [
						'basicAuth',
					],
				},
			},
			default: '',
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authType: [
						'bearerToken',
					],
				},
			},
			default: '',
		},
	];
}
