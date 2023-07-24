const slagify = require('slugify');

function generateSlug(name) {
	if (typeof name === 'string') {
		return slagify(name, { lower: true, strict: true });
	} else if (typeof name === 'object') {
		const slugTranslations = {};
		for (let key in name) {
			if (name.hasOwnProperty(key)) {
				slugTranslations[key] = slagify(name[key], { lower: true, strict: true });
			}
		}
		return slugTranslations;
	}
	return name; // If name is not a string or an object, return as it is.
}

module.exports = generateSlug;
