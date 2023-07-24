module.exports = (app) => {
	app.use((req, res, next) => {
		const error = new Error('Invalid Route. Please check your route!');
		error.status = 404;
		next(error);
	});
};
