/**
* Checks if paginated list object has next page
*
* @param  {Object} data
* @return {Boolean} true if there is next page link
*/
export const isDataPaginated = data => {
	return data.links && data.links.next;
}

/**
* Returns data array from data object
*
* @param  {Object} data
* @return {Array} data array
*/
export const getDataArray = data => {
	return data.data.length ? data.data : [];
}