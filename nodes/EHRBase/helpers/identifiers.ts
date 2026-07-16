export function parseVersionUid(versionUid: string): { objectId: string; creatingSystemId: string; versionTreeId: string } {
	const parts = versionUid.split('::');
	if (parts.length !== 3) {
		throw new Error(`Invalid version UID format: ${versionUid}. Expected objectId::creatingSystemId::versionTreeId`);
	}
	return {
		objectId: parts[0],
		creatingSystemId: parts[1],
		versionTreeId: parts[2],
	};
}
