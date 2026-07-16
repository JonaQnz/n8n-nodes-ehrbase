export function handleEhrbaseError(error: any): Error {
	if (error.response && error.response.status) {
		const status = error.response.status;
		let message = `EHRbase API Error (${status})`;
		
		if (error.response.data) {
			if (typeof error.response.data === 'string') {
				message += `: ${error.response.data}`;
			} else if (error.response.data.error) {
				message += `: ${error.response.data.error}`;
			} else if (error.response.data.message) {
				message += `: ${error.response.data.message}`;
			}
		} else if (error.message) {
			message += `: ${error.message}`;
		}

		const err = new Error(message);
		Object.assign(err, { httpStatusCode: status });
		return err;
	}
	
	if (error.message) {
		return new Error(`EHRbase Request Error: ${error.message}`);
	}
	
	return error;
}
