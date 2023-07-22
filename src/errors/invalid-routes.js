module.exports = (app) => {
	app.use((req, res, next) => {
		const error = new Error('Invalid Route');
		error.status = 404;
		next(error);
		return;
	});
};
