const fs = require('fs');

module.exports = (filePath) => {
	fs.unlinkSync(filePath, (err) => {
		if (err) {
			return false;
		}
	});
	return true;
};
