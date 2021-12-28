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

	/**
	* Exchanging the api key for an access token
	*
	* @async
	* @param  {String} apiKey
	* @return {Promise<object>} promise of token data object
 	*/
	static postToken = async apiKey  => {

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

	/**
	* Creating the user
	*
	* @async
	* @param  {Object} token token object
	* @return {Promise<string>} promise of userID string
 	*/
	static postUser = async ( data, token ) => {
		const accessToken = await token.getToken();
		  
		const config = {
			method: 'post',
			url: '/users',
			baseURL,
			headers: defaultPostHeaders(accessToken),
			data
		};
		  
		return await axios(config).then(
			response => {
				const userID = response.data.id;
				return userID;
		}).catch( error => { new Error(error).handleError() } )
	}

	/**
	* Creating a connection to an institution
	*
	* @async
	* @param  {String} userID
	* @param  {String} data stringified object with username and password
	* @param  {Object} token token object
	* @return {Promise<string>} promise of jobID string
 	*/
	static postConnection = async ( userID, data, token ) => {
		const accessToken = await token.getToken();
	
		const config = {
			method: 'post',
			baseURL,
			url: `/users/${userID}/connections`,
			headers: defaultPostHeaders(accessToken),
			data
		}
	
		return await axios(config).then(
			response => { 
				const jobID = response.data.id;
				return jobID;
			}
		).catch( error => { new Error(error).handleError() } )
	}

	/**
	* Retrieves the details of an existing job
	*
	* @async
	* @param  {String} jobID
	* @param  {Object} token token object
	* @return {Promise<object>} promise of job object
 	*/
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

	/**
	* Retrieves transactions
	*
	* @async
	* @param  {String} userID
	* @param  {Object} token token object
	* @param  {String} next url for the next transactions chunk
	* @return {Promise<object>} promise of transactions object
 	*/
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