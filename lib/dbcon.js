var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'student',
	password: 'default',
	database: 'student',
	dateStrings: 'true'
});

module.exports.pool = pool;

// http://eecs.oregonstate.edu/ecampus-video/CS290/core-content/node-mysql/using-server-sql.html