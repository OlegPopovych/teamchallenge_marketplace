const separateFullNameToArray = (fullName) => {
	return fullName.split(' ');
}

const validationGoodsAddData = (data) => {
	const { author, author_id, title, description, price, category, condition, location, } = data;

	if (!author) {
		console.log("invalid author")
		return false;
	}

	if (!author_id) {
		console.log("invalid author_id")
		return false;
	}

	if (!title) {
		console.log("invalid title")
		return false;
	}

	if (!condition) {
		console.log("invalid condition")
		return false;
	}

	if (!parseInt(price) && !price) {
		console.log("invalid title")
		return false;
	}

	if (!category) {
		console.log("invalid price")
		return false;
	}

	return true;
}

module.exports = { separateFullNameToArray, validationGoodsAddData };