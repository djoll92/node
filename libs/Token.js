
import BasiqApi from './BasiqApi.js';
import dotenv from 'dotenv';
dotenv.config();

class Token {

	getToken = async () => {
		if (this.tokenData && !this.isTokenExpired()) {
			return this.tokenData.access_token;
		}
		const tokenData = await BasiqApi.postToken(process.env.API_KEY);
		const token = tokenData.access_token;
		this.tokenTimeStamp = Date.now();
		this.tokenData = tokenData;

		return token;
	};

	isTokenExpired = () => {
		const tokenExpirationTime = this.tokenData.expires_in * 1000;
		return Date.now() - this.tokenTimeStamp > tokenExpirationTime;
	};
}

export default Token;