import BasiqApi from './BasiqApi.js';
import { isDataPaginated, getDataArray } from '../helper/helper.js';

class Transactions {
	constructor( jobID, userID, token ) {
		this.jobID = jobID;
		this.userID = userID;
		this.token = token;
	}

	/**
	* Checks if retreive transaction job status is a success
	*
	* @async
	* @return {Promise<boolean>} returns promise of truthy value if job status is success
 	*/
	areTransactionsLoaded = async () => {
		const job = await BasiqApi.getJob(this.jobID, this.token);
		const steps = job.steps;
		const retrieveTransactionsStep = steps.filter( step => step.title === 'retrieve-transactions' )[0];
		return 'success' === retrieveTransactionsStep.status;
	}

	/**
	* Keeps checking retrive transactions job status until it is successfull
 	*/
	waitForTransactions = () => {
		let counter = 10;
		let transactionsReady = false;
		
		while ( ! transactionsReady && counter !== 0 ) {
			transactionsReady = this.areTransactionsLoaded(this.jobID, this.token);
			counter--;
			setTimeout(() => {}, 1000);
		}
		
		if ( counter === 0 ) {
			console.log('Connection timed out.');
		}
	}
	

	/**
	* Returns the array of all transactions
	*
	* @async
	* @return {Promise<Array>} promise of array containing transaction objects
 	*/
	getAllTransactions = async () => {
		const transactionsReady = await this.areTransactionsLoaded();

		if ( !transactionsReady ) {
			this.waitForTransactions();
		}

		let transactionsData = await BasiqApi.getTransactions(this.userID, this.token);
	
		let allTransactions = getDataArray(transactionsData);
		
		while ( isDataPaginated(transactionsData) ) {
			transactionsData = await BasiqApi.getTransactions(this.userID, this.token, transactionsData.links.next);
	
			allTransactions.push( ...getDataArray(transactionsData) );
		}
	
		this.transaction = allTransactions;
		return allTransactions;
	}

	/**
	* Creates and returns transactions categories object
	*
	* @async
	* @param  {Array} transactions array containing transaction objects
	* @return {Promise<object>} promise of object formatted like associative array with category codes as attribute keys and category names as attribute values
 	*/
	getTransactionCategories = async transactions => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		let transactionCategories = {};
		
		transactions.forEach( ( transaction ) => {
			const categoryCode = transaction.subClass ? transaction.subClass.code : '';
			const categoryName = transaction.subClass ? transaction.subClass.title : '';
	
			if ( categoryCode && !transactionCategories.hasOwnProperty(categoryCode) ){
				transactionCategories[categoryCode] = categoryName;
			}
	
		})
		return transactionCategories;
	}
	
	/**
	* Creates and returns object of transactions grouped by the existing categories
	*
	* @async
	* @param  {Array} transactions array containing transaction objects
	* @param  {Object} transactionCategories object formatted like associative array with category codes as attribute keys and category names as attribute values
	* @return {Promise<object>} promise of object formatted like associative array with category codes as attribute keys and array of transaction objects as attribute values
 	*/
	getTransactionsByCategory = async ( transactions, transactionCategories ) => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		transactionCategories = typeof transactionCategories !== 'undefined' ? transactionCategories : await this.getTransactionCategories(transactions);
		let categorizedTransactions = {};
	
		for (const categoryCode in transactionCategories ) {
			categorizedTransactions[categoryCode] = transactions.filter(transaction =>
				transaction.subClass && categoryCode === transaction.subClass.code
			)
		}
	
		return categorizedTransactions;
	}
	
	/**
	* Returns the sum of transaction amounts
	*
	* @async
	* @param  {Array} transactions array containing transaction objects
	* @return {Promise<number>} promise of transactions amounts total number
 	*/
	getTransactionsTotalAmount = async transactions => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		let sum = 0;
		transactions.forEach( transaction => {
			sum += Math.abs(parseFloat(transaction.amount));
		})
		return sum;
	}
	
	/**
	* Returns the average amount value for transactions
	*
	* @async
	* @param  {Array} transactions array containing transaction objects
	* @return {Promise<number>} promise of transactions average amount number
 	*/
	getTransactionsAvgAmount = async transactions => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		const avgAmount = await this.getTransactionsTotalAmount(transactions) / transactions.length;
		return avgAmount;
	}
	
	/**
	* Returns average amount per transaction category
	*
	* @async
	* @param  {Array} transactions array containing transaction objects
	* @return {Promise<object>} promise of object formatted like associative array with category codes as attribute keys and objects (containing category names and average amounts) as values
 	*/
	getTransactionsAvgAmountByCategory = async transactions => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		const categories = await this.getTransactionCategories(transactions);
		const categorizedTransactions = await this.getTransactionsByCategory(transactions, categories);
		let transactionsAvgAmount = {};
	
		for (const categoryCode in categorizedTransactions ) {
			const avgAmount = await this.getTransactionsAvgAmount(categorizedTransactions[categoryCode]);
			transactionsAvgAmount[categoryCode] = { categoryName: categories[categoryCode], avgAmount };
		}
		
		return transactionsAvgAmount;
	}

	/**
	* Returns the array of all transactions if it is set, or gets all transactions from api call otherwise
	*
	* @async
	* @return {Promise<Array>} promise of array containing transaction objects
 	*/
	getTransactions = async () => {
		if (this.transactions && this.transactions.length) {
			return this.transactions;
		}
		const transactions = await this.getAllTransactions();
		this.transactions = transactions;

		return transactions;
	}
}

export default Transactions;