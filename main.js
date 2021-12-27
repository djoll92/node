import Token from './libs/Token.js';
import BasiqApi from './libs/BasiqApi.js';
import Transactions from './libs/Transactions.js';

const main = async () => {

	const token = new Token();

	const userID = await BasiqApi.postUser(token);

	const jobID = await BasiqApi.postConnection(userID, token);

	const transactions = new Transactions( jobID, userID, token );

	console.log( await transactions.getTransactionsAvgAmountByCategory());
}

main();
