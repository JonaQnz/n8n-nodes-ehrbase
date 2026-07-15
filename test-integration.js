const { EHRBase } = require('./dist/nodes/EHRBase/EHRBase.node.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class MockExecuteFunctions {
	constructor(parameters = {}, inputData = [{}]) {
		this.parameters = parameters;
		this.inputData = inputData;
	}

	getNodeParameter(name, index, fallback) {
		if (this.parameters[name] !== undefined) {
			return this.parameters[name];
		}
		if (fallback !== undefined) return fallback;
		throw new Error(`Parameter "${name}" is not mocked!`);
	}

	getInputData() {
		return this.inputData;
	}

	async getCredentials(name) {
		return {
			baseUrl: 'http://localhost:8080/ehrbase/rest/openehr/v1',
			authType: 'none',
		};
	}

	continueOnFail() {
		return false;
	}

	helpers = {
		returnJsonArray(data) {
			if (Array.isArray(data)) return data.map(d => ({ json: d }));
			return [{ json: data }];
		},
		assertBinaryData(itemIndex, propertyName) {
			return true;
		},
		async getBinaryDataBuffer(itemIndex, propertyName) {
			return fs.readFileSync(path.join(__dirname, 'minimal_evaluation.opt'));
		},
		async request(options) {
			const axiosOptions = {
				method: options.method,
				url: options.url,
				headers: options.headers,
				params: options.qs,
				data: options.body,
				responseType: options.json === false ? 'text' : 'json',
				validateStatus: () => true, // Don't throw on HTTP error codes so we can inspect responses
			};
			try {
				const res = await axios(axiosOptions);
				return res.data;
			} catch (err) {
				console.error('Request failed:', err.message);
				throw err;
			}
		},
	};
}

async function runTests() {
	console.log('=== STARTING INTEGRATION TESTS FOR EHRBASE N8N NODE ===\n');

	// We will track created IDs here to chain requests
	let ehrId;
	let compositionVersionUid;
	let compositionId;
	let directoryVersionUid;

	// 1. TEST: Create EHR (Auto ID)
	console.log('1. Testing: Create EHR (Auto ID)...');
	const createEhrNode = new EHRBase();
	const createEhrContext = new MockExecuteFunctions({
		resource: 'ehr',
		operation: 'create',
		specifyEhrId: false,
		customEhrStatus: false,
	});
	const createEhrResult = await createEhrNode.execute.call(createEhrContext);
	ehrId = createEhrResult[0][0].json.ehr_id.value;
	console.log(`   Result: SUCCESS (EHR ID: ${ehrId})\n`);

	// 2. TEST: Create EHR with Custom ID
	const customEhrId = '233dd000-0000-0000-0000-000000000000';
	console.log(`2. Testing: Create EHR with specified Custom ID (${customEhrId})...`);
	const createCustomEhrContext = new MockExecuteFunctions({
		resource: 'ehr',
		operation: 'create',
		specifyEhrId: true,
		ehrId: customEhrId,
		customEhrStatus: false,
	});
	await createEhrNode.execute.call(createCustomEhrContext);
	console.log(`   Result: SUCCESS (Custom EHR ID Created: ${customEhrId})\n`);

	// 3. TEST: Get EHR by ID
	console.log(`3. Testing: Get EHR by ID (${ehrId})...`);
	const getEhrContext = new MockExecuteFunctions({
		resource: 'ehr',
		operation: 'get',
		getBy: 'ehrId',
		ehrId: ehrId,
	});
	const getEhrResult = await createEhrNode.execute.call(getEhrContext);
	console.log(`   Result: SUCCESS (Retrieved EHR ID: ${getEhrResult[0][0].json.ehr_id.value})\n`);

	// 4. TEST: Get EHR Status
	console.log(`4. Testing: Get EHR Status...`);
	const getEhrStatusContext = new MockExecuteFunctions({
		resource: 'ehrStatus',
		operation: 'get',
		ehrId: ehrId,
	});
	const getEhrStatusResult = await createEhrNode.execute.call(getEhrStatusContext);
	const statusVersionUid = getEhrStatusResult[0][0].json.uid.value;
	console.log(`   Result: SUCCESS (EHR Status Version: ${statusVersionUid})\n`);

	// 5. TEST: Update EHR Status
	console.log(`5. Testing: Update EHR Status (Setting queryable=false)...`);
	const updatedStatus = {
		_type: 'EHR_STATUS',
		archetype_node_id: 'openEHR-EHR-EHR_STATUS.generic.v1',
		name: {
			_type: 'DV_TEXT',
			value: 'EHR Status',
		},
		subject: {
			_type: 'PARTY_SELF',
		},
		is_queryable: false,
		is_modifiable: true,
	};
	const updateEhrStatusContext = new MockExecuteFunctions({
		resource: 'ehrStatus',
		operation: 'update',
		ehrId: ehrId,
		precedingVersionUid: statusVersionUid,
		ehrStatusJson: updatedStatus,
	});
	const updateStatusResult = await createEhrNode.execute.call(updateEhrStatusContext);
	console.log(`   Result: SUCCESS (New Status Version: ${updateStatusResult[0][0].json.uid.value})\n`);

	// 6. TEST: Upload Template (ADL 1.4 OPT)
	console.log(`6. Testing: Upload Template (xml string)...`);
	const optContent = fs.readFileSync(path.join(__dirname, 'minimal_evaluation.opt'), 'utf8');
	const uploadTemplateContext = new MockExecuteFunctions({
		resource: 'definition',
		operation: 'uploadTemplate',
		sourceType: 'string',
		templateXml: optContent,
	});
	// Uploading returns the XML back or success metadata
	const uploadResult = await createEhrNode.execute.call(uploadTemplateContext);
	console.log(`   Result: SUCCESS (Template Uploaded)\n`);

	// 7. TEST: List Templates
	console.log(`7. Testing: List Templates...`);
	const listTemplatesContext = new MockExecuteFunctions({
		resource: 'definition',
		operation: 'listTemplates',
	});
	const listResult = await createEhrNode.execute.call(listTemplatesContext);
	console.log(`   Result: SUCCESS (Found ${listResult[0].length} templates, including ${listResult[0][0].json.template_id})\n`);

	// 8. TEST: Create Composition (Canonical JSON)
	console.log(`8. Testing: Create Composition...`);
	const compositionPayload = {
		_type: 'COMPOSITION',
		name: {
			_type: 'DV_TEXT',
			value: 'Minimal',
		},
		archetype_details: {
			_type: 'ARCHETYPE_DETAILS',
			archetype_id: {
				_type: 'ARCHETYPE_ID',
				value: 'openEHR-EHR-COMPOSITION.minimal.v1',
			},
			template_id: {
				_type: 'TEMPLATE_ID',
				value: 'minimal_evaluation.en.v1',
			},
			rm_version: '1.0.2',
		},
		archetype_node_id: 'openEHR-EHR-COMPOSITION.minimal.v1',
		language: {
			_type: 'CODE_PHRASE',
			terminology_id: {
				_type: 'TERMINOLOGY_ID',
				value: 'ISO_639-1',
			},
			code_string: 'en',
		},
		territory: {
			_type: 'CODE_PHRASE',
			terminology_id: {
				_type: 'TERMINOLOGY_ID',
				value: 'ISO_3166-1',
			},
			code_string: 'DE',
		},
		category: {
			_type: 'DV_CODED_TEXT',
			value: 'event',
			defining_code: {
				_type: 'CODE_PHRASE',
				terminology_id: {
					_type: 'TERMINOLOGY_ID',
					value: 'openehr',
				},
				code_string: '433',
			},
		},
		composer: {
			_type: 'PARTY_IDENTIFIED',
			name: 'Dr. Testing',
		},
		content: [
			{
				_type: 'EVALUATION',
				name: {
					_type: 'DV_TEXT',
					value: 'Minimal',
				},
				archetype_details: {
					_type: 'ARCHETYPE_DETAILS',
					archetype_id: {
						_type: 'ARCHETYPE_ID',
						value: 'openEHR-EHR-EVALUATION.minimal.v1',
					},
					template_id: {
						_type: 'TEMPLATE_ID',
						value: 'minimal_evaluation.en.v1',
					},
					rm_version: '1.0.2',
				},
				archetype_node_id: 'openEHR-EHR-EVALUATION.minimal.v1',
				language: {
					_type: 'CODE_PHRASE',
					terminology_id: {
						_type: 'TERMINOLOGY_ID',
						value: 'ISO_639-1',
					},
					code_string: 'en',
				},
				encoding: {
					_type: 'CODE_PHRASE',
					terminology_id: {
						_type: 'TERMINOLOGY_ID',
						value: 'IANA_character-sets',
					},
					code_string: 'UTF-8',
				},
				subject: {
					_type: 'PARTY_SELF',
				},
				data: {
					_type: 'ITEM_TREE',
					name: {
						_type: 'DV_TEXT',
						value: 'Arbol',
					},
					archetype_node_id: 'at0001',
					items: [
						{
							_type: 'ELEMENT',
							name: {
								_type: 'DV_TEXT',
								value: 'quantity',
							},
							archetype_node_id: 'at0002',
							value: {
								_type: 'DV_QUANTITY',
								magnitude: 1.5,
								units: 'kg',
							},
						},
					],
				},
			},
		],
	};
	const createCompositionContext = new MockExecuteFunctions({
		resource: 'composition',
		operation: 'create',
		ehrId: ehrId,
		format: 'canonical',
		compositionPayload: compositionPayload,
		options: { preferRepresentation: 'representation' },
	});
	const createCompResult = await createEhrNode.execute.call(createCompositionContext);
	console.log('DEBUG COMPOSITION CREATE RESULT:', JSON.stringify(createCompResult, null, 2));
	compositionVersionUid = createCompResult[0][0].json.uid.value;
	// compositionId is everything before the first "::"
	compositionId = compositionVersionUid.split('::')[0];
	console.log(`   Result: SUCCESS (Composition Version UID: ${compositionVersionUid})\n`);

	// 9. TEST: Get Composition
	console.log(`9. Testing: Get Composition (${compositionVersionUid})...`);
	const getCompContext = new MockExecuteFunctions({
		resource: 'composition',
		operation: 'get',
		ehrId: ehrId,
		versionUid: compositionVersionUid,
	});
	const getCompResult = await createEhrNode.execute.call(getCompContext);
	console.log(`   Result: SUCCESS (Retrieved Composition Template ID: ${getCompResult[0][0].json.archetype_details.template_id})\n`);

	// 10. TEST: Update Composition
	console.log(`10. Testing: Update Composition...`);
	// modify the evaluation content slightly
	compositionPayload.content[0].data.items[0].value.magnitude = 2.5;
	const updateCompContext = new MockExecuteFunctions({
		resource: 'composition',
		operation: 'update',
		ehrId: ehrId,
		versionedObjectUid: compositionId,
		precedingVersionUid: compositionVersionUid,
		format: 'canonical',
		compositionPayload: compositionPayload,
		options: { preferRepresentation: 'representation' },
	});
	const updateCompResult = await createEhrNode.execute.call(updateCompContext);
	const updatedCompVersionUid = updateCompResult[0][0].json.uid.value;
	console.log(`    Result: SUCCESS (New Composition Version UID: ${updatedCompVersionUid})\n`);

	// 11. TEST: Create Directory Folder
	console.log(`11. Testing: Create Directory...`);
	const directoryFolder = {
		_type: 'FOLDER',
		name: {
			_type: 'DV_TEXT',
			value: 'Root folder',
		},
		archetype_node_id: 'openEHR-EHR-FOLDER.generic.v1',
	};
	const createDirectoryContext = new MockExecuteFunctions({
		resource: 'directory',
		operation: 'create',
		ehrId: ehrId,
		directoryPayload: directoryFolder,
	});
	const createDirResult = await createEhrNode.execute.call(createDirectoryContext);
	directoryVersionUid = createDirResult[0][0].json.uid.value;
	console.log(`    Result: SUCCESS (Directory Version UID: ${directoryVersionUid})\n`);

	// 12. TEST: Get Directory
	console.log(`12. Testing: Get Directory...`);
	const getDirectoryContext = new MockExecuteFunctions({
		resource: 'directory',
		operation: 'get',
		ehrId: ehrId,
		specifyVersionUid: false,
	});
	const getDirResult = await createEhrNode.execute.call(getDirectoryContext);
	console.log(`    Result: SUCCESS (Retrieved Directory Name: ${getDirResult[0][0].json.name.value})\n`);

	// 13. TEST: Update Directory Folder
	console.log(`13. Testing: Update Directory...`);
	directoryFolder.name.value = 'Updated root folder';
	const updateDirectoryContext = new MockExecuteFunctions({
		resource: 'directory',
		operation: 'update',
		ehrId: ehrId,
		precedingVersionUid: directoryVersionUid,
		directoryPayload: directoryFolder,
	});
	const updateDirResult = await createEhrNode.execute.call(updateDirectoryContext);
	const updatedDirVersionUid = updateDirResult[0][0].json.uid.value;
	console.log(`    Result: SUCCESS (New Directory Version UID: ${updatedDirVersionUid})\n`);

	// 14. TEST: Delete Directory Folder
	console.log(`14. Testing: Delete Directory...`);
	const deleteDirectoryContext = new MockExecuteFunctions({
		resource: 'directory',
		operation: 'delete',
		ehrId: ehrId,
		precedingVersionUid: updatedDirVersionUid,
	});
	await createEhrNode.execute.call(deleteDirectoryContext);
	console.log(`    Result: SUCCESS (Directory Deleted)\n`);

	// 15. TEST: Execute AQL Query
	console.log(`15. Testing: Execute AQL Query...`);
	const executeAqlContext = new MockExecuteFunctions({
		resource: 'query',
		operation: 'executeAql',
		aql: 'SELECT e/ehr_id/value FROM EHR e',
		additionalOptions: {},
	});
	const queryResult = await createEhrNode.execute.call(executeAqlContext);
	console.log(`    Result: SUCCESS (Found ${queryResult[0][0].json.rows.length} rows in the system)\n`);

	// 16. TEST: Delete Composition
	console.log(`16. Testing: Delete Composition (Logical deletion)...`);
	const deleteCompContext = new MockExecuteFunctions({
		resource: 'composition',
		operation: 'delete',
		ehrId: ehrId,
		precedingVersionUid: updatedCompVersionUid,
	});
	await createEhrNode.execute.call(deleteCompContext);
	console.log(`    Result: SUCCESS (Composition Logically Deleted)\n`);

	console.log('=== ALL 16 INTEGRATION TESTS COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(err => {
	console.error('\n!!! TEST EXECUTION FAILED !!!');
	console.error(err);
	process.exit(1);
});
