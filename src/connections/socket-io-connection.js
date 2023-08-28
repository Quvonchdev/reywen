const socketIo = require('socket.io');

let io;

module.exports = {
	init: (server) => {
		io = socketIo(server);
		return io;
	},
	getIO: () => {
		if (!io) {
			throw new Error('Socket.IO not initialized!');
		}
		return io;
	},
};
