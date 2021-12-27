import Error from './Error.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = process.env.BASIQ_API_URL;
const defaultPostHeaders = accessToken => {
	return { 
		'Authorization': `Bearer ${accessToken}`, 
		'Accept': 'application/json', 
		'Content-Type': 'application/json'
	}
}
const defaultGetHeaders = accessToken => {
	return {
		'Authorization': `Bearer ${accessToken}`,
		'Accept': 'application/json',
	}
}

class BasiqApi {
	
	static postToken = async apiKey => {

		const config = {
			method: 'post',
			url: '/token',
			baseURL,
			headers: {
				'Authorization': `Basic ${apiKey}`,
				'Content-Type': 'application/x-www-form-urlencoded',
				'basiq-version': '2.0'
			},
			data: process.env.TOKEN_DATA
		};

		return await axios(config).then(
			response => {
				return response.data;
			}
		).catch(error => { new Error(error).handleError() });
	};

	static postUser = async token => {
		const accessToken = await token.getToken();
		  
		const config = {
			method: 'post',
			url: '/users',
			baseURL,
			headers: defaultPostHeaders(accessToken),
			data: process.env.USER_DATA
		};
		  
		return await axios(config).then(
			response => {
				const userID = response.data.id;
				return userID;
		}).catch( error => { new Error(error).handleError() } )
	}

	static postConnection = async ( userID, token ) => {
		const accessToken = await token.getToken();
	
		const config = {
			method: 'post',
			baseURL,
			url: `/users/${userID}/connections`,
			headers: defaultPostHeaders(accessToken),
			data: process.env.CONNECTION_DATA
		}
	
		return await axios(config).then(
			response => { 
				const jobID = response.data.id;
				return jobID;
			}
		).catch( error => { new Error(error).handleError() } )
	}

	static getJob = async (jobID, token) => {
		const accessToken = await token.getToken();
	
		const config = {
			method: 'get',
			url: `/jobs/${jobID}`,
			baseURL,
			headers: defaultGetHeaders(accessToken),
		}
	
		return await axios(config).then(
			response => {
				return response.data;
			}
		).catch( error => { new Error(error).handleError() } )
	
	}

	static getTransactions = async ( userID, token, next ) => {
		const accessToken = await token.getToken();
		next = typeof next !== 'undefined' ? next : '';
	
		const config = {
			method: 'get',
			url: next || `${baseURL}/users/${userID}/transactions`,
			headers: defaultGetHeaders(accessToken),
		}
	
		return await axios(config).then(
			response => {
				return response.data;
			}
		).catch( error => { new Error(error).handleError() } )
	}
}

export default BasiqApi;