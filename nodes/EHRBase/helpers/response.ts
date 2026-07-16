import { JsonObject } from 'n8n-workflow';

export function normalizeResponse(response: any, outputFormat: string = 'raw'): JsonObject | JsonObject[] {
	if (outputFormat === 'simplified' && response && typeof response === 'object' && !Array.isArray(response)) {
		const simplified: JsonObject = {};
		for (const [key, value] of Object.entries(response)) {
			if (value && typeof value === 'object' && 'value' in (value as object)) {
				simplified[key] = (value as any).value;
			} else {
				simplified[key] = value as any;
			}
		}
		return simplified;
	}
	return response as JsonObject | JsonObject[];
}
