import Token from './libs/Token.js';
import BasiqApi from './libs/BasiqApi.js';
import Transactions from './libs/Transactions.js';
import dotenv from 'dotenv';
dotenv.config();

const main = async () => {

	const token = new Token();

	const userID = await BasiqApi.postUser(process.env.USER_DATA, token);

	const jobID = await BasiqApi.postConnection(userID, process.env.CONNECTION_DATA, token);

	const transactions = new Transactions( jobID, userID, token );

	const avgTransactionsAmountByCategory = await transactions.getTransactionsAvgAmountByCategory();

	console.log( avgTransactionsAmountByCategory );
}

main();
