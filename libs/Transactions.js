import BasiqApi from './BasiqApi.js';
import { isDataPaginated, getDataArray } from '../helper/helper.js';

class Transactions {
	constructor( jobID, userID, token ) {
		this.jobID = jobID;
		this.userID = userID;
		this.token = token;
	}

	areTransactionsLoaded = async () => {
		const job = await BasiqApi.getJob(this.jobID, this.token);
		const steps = job.steps;
		const retrieveTransactionsStep = steps.filter( step => step.title === 'retrieve-transactions' )[0];
		return 'success' === retrieveTransactionsStep.status;
	}

	waitForTransactions = ( transactionsReady ) => {
		let counter = 10;
		
		while ( ! transactionsReady && counter !== 0 ) {
			transactionsReady = this.areTransactionsLoaded(this.jobID, this.token);
			counter--;
			setTimeout(() => {}, 1000);
		}
		
		if ( counter === 0 ) {
			console.log('Connection timed out.');
		}
	}
	
	getAllTransactions = async () => {
		const transactionsReady = await this.areTransactionsLoaded();

		if ( !transactionsReady ) {
			this.waitForTransactions(transactionsReady);
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
	
	getTransactionsTotalAmount = async transactions => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		let sum = 0;
		transactions.forEach( transaction => {
			sum += Math.abs(parseFloat(transaction.amount));
		})
		return sum;
	}
	
	getTransactionsAvgAmount = async transactions => {
		transactions = typeof transactions !== 'undefined' ? transactions : await this.getTransactions();
		const avgAmount = await this.getTransactionsTotalAmount(transactions) / transactions.length;
		return avgAmount;
	}
	
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