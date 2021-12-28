
import BasiqApi from './BasiqApi.js';
import dotenv from 'dotenv';
dotenv.config();

class Token {
	/**
	* Gets access token and sets initial token time stamp and data inside current object
	*
	* @async
	* @return {Promise<string>} promise of access token string
 	*/
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

	/**
	* Checks if token is expired
	*
	* @return {Boolean} true if token has expired
 	*/
	isTokenExpired = () => {
		const tokenExpirationTime = this.tokenData.expires_in * 1000;
		return Date.now() - this.tokenTimeStamp > tokenExpirationTime;
	};
}

export default Token;