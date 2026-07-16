import { IExecuteFunctions } from 'n8n-workflow';
import { ehrbaseApiRequest } from '../transport/ehrbaseApiRequest';

export async function executeDefinition(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'listTemplates') {
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: '/definition/template/adl1.4',
		});
	} else if (operation === 'getTemplate') {
		const templateId = this.getNodeParameter('templateId', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: `/definition/template/adl1.4/${templateId}`,
		});
	} else if (operation === 'listArchetypes') {
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: '/definition/archetype',
		});
	} else if (operation === 'getArchetype') {
		const archetypeId = this.getNodeParameter('archetypeId', i) as string;
		return await ehrbaseApiRequest.call(this, {
			method: 'GET',
			endpoint: `/definition/archetype/${archetypeId}`,
		});
	} else if (operation === 'uploadTemplate') {
		const sourceType = this.getNodeParameter('sourceType', i) as string;
		let body: string;

		if (sourceType === 'binary') {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			this.helpers.assertBinaryData(i, binaryPropertyName);
			const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
			body = buffer.toString('utf8');
		} else {
			body = this.getNodeParameter('templateXml', i) as string;
		}

		return await ehrbaseApiRequest.call(this, {
			method: 'POST',
			endpoint: '/definition/template/adl1.4',
			body,
			format: 'canonicalXml',
		});
	}

	throw new Error(`Unsupported Definition operation: ${operation}`);
}
