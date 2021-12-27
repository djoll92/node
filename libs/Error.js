class Error {
	constructor(error) {
		this.error = error;
	}

	handleError = () => {
		const error = this.error;
		if (error.response) {
			console.error('Error response data => ', error.response.data);
			console.error('Error response status => ', error.response.status);
			console.error('Error response headers => ', error.response.headers);
		} else if (error.request) {
			console.error('Error request => ', error.request);
		} else {
			console.error('Error message =>', error.message);
		}
		process.on('unhandledRejection', (reason, promise) => {});
	}
}

export default Error;