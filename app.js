/****************************************************************************************
*	Author: Chris Kearns
*    Date: 03 Aug 2016
*	Workout tracker in Node.js.
*    First use or table reset requires call to "h ttp://52.41.119.135:3000/reset-table/".
****************************************************************************************/
var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./lib/dbcon.js');
var request = require('request');
var path = require('path');
var favicon = require('serve-favicon');

var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'Favicon.ico')));

app.set('port', 3000);

// Initial Home Page load.
app.get('/', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
	if(err){
		next(err);
		return;
	}
	var workoutArray = [];
	for(var td in rows){
		workoutArray.push({'name':rows[td].name, 'reps':rows[td].reps, 'weight':rows[td].weight,
							'date':rows[td].date, 'lbs':rows[td].lbs, 'id':rows[td].id})
	}
	context.workouts = workoutArray;
	res.render('home', context);
	});
});


/*	Insert data (does not render a page) on "Submit", uses an AJAX update call from dbUIscript.js 
	instead to append row. See home.handlebars and dbUIscript.js.
*/
app.get('/insert', function(req, res, next){
	var context = {};
	/*  Inhibits query on new exercise input with empty 'name' field in the form. home & update.handlebars
		have 'required' keyword in html form input field for name element. */
	if(req.query.workoutName == ""){
		return;
	}
	mysql.pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)",
			[req.query.workoutName, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result){
		if(err){
			next(err);
			return;
		}
		context.workouts = result.insertId;
		res.send(JSON.stringify(context));
	});
});


// Update page for changing data by selected row. Renders on "Edit" button click.
app.get('/update', function(req, res, next) {
	var context = {};
	mysql.pool.query("UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id = ?",
					 [req.query.workoutName, req.query.reps, req.query.weight, req.query.date, req.query.lbs,
					  req.query.id], function(err, result) {
		mysql.pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
			if(err){
				next(err);
				return;
			}
		var workoutArray = [];
		for(var td in rows){
			workoutArray.push({'name': rows[td].name, 'reps':rows[td].reps, 'weight':rows[td].weight,
								'date':rows[td].date, 'lbs':rows[td].lbs, 'id':rows[td].id})
		}
		context.workouts = workoutArray;
		res.render('home', context);   
		});   
	});
});


// Edit a row - pre-populates form input fields following "Edit" button click and renders to /update.
app.get('/editRow', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM `workouts` WHERE id=?', [req.query.id], function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		var workoutArray = [];
		for(var td in rows){
			workoutArray.push({'name':rows[td].name, 'reps':rows[td].reps, 'weight':rows[td].weight,
								'date':rows[td].date, 'lbs':rows[td].lbs, 'id':rows[td].id})
		}
		context.workouts = workoutArray[0];
		res.render('update', context);
	});
});


// Delete data on "Delete" button click. Renders via AJAX call.
app.get('/deleteRow', function(req, res, next) {
	var context = {};
	mysql.pool.query("DELETE FROM `workouts` WHERE id = ?", [req.query.id], function(err, result) {
		if(err){
			next(err);
			return;
		}
		mysql.pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
			if(err){
				next(err);
				return;
			} 
			context.results = JSON.stringify(rows);
			res.render('home', context);
		});   
	});
});


// Reset table and initial table load. [Citation 2]
app.get('/reset-table', function(req, res, next){
	var context = {};
	mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ 
		var createString = "CREATE TABLE workouts(" +
			"id INT PRIMARY KEY AUTO_INCREMENT," +
			"name VARCHAR(255) NOT NULL," +
			"reps INT," +
			"weight INT," +
			"date DATE NOT NULL," +
			"lbs BOOLEAN)";
		mysql.pool.query(createString, function(err){
			context.results = "Table reset";
			res.render('home', context);
		})
	});
});

// Utility function to see what is being sent in the Request Header.
app.get('/headers', function (req, res) {
     res.set('Content-Type', 'text/plain');
     var s = '';
     for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
     res.send(s);
});


// Handle 404 error.
app.use(function(req, res){
	res.status(404);
	res.render('404 File Not Found');
});

// Handle 500 error.
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('plain/text');
	res.status(500);
	res.render('500 Internal Server Error');
});

app.listen(app.get('port'), function(){
	console.log('app.js process started on Port: ' + app.get('port') + '; press Ctrl-C to terminate.');
});
