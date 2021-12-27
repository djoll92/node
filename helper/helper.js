export const isDataPaginated = data => {
	return data.links && data.links.next;
}

export const getDataArray = data => {
	return data.data.length ? data.data : []
}