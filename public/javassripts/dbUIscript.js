/***********************************************************************************************************
*	Server URL as required by assignment instructions: h ttp://52.41.119.135:3000/
*	
*	Chris Kearns, kearnsc@oregonstate.edu, cs290-400-Summer16-Database UI, 03 Aug 2016
*
*	dbUIscript.js included by home.handlebars. Processes '<form id="newExercise" action="/insert">'
*	on "submit" and each rows "delete" button onclick="deleteExercise('exerciseTable', this, {{this.id}})"
*	via AJAX calls. Uses an event listener callback function to, on submit, builds the row, td by td, and
*	senda the new row via XMLHttp ajax call. 
***********************************************************************************************************/
var workoutForm = document.getElementById("newExercise");

workoutForm.addEventListener("submit", function(e){
	e.preventDefault();
	var req = new XMLHttpRequest();
	var targetPage = '/insert';
	var getParameters = "workoutName=" + workoutForm.elements.workoutName.value + "&reps=" + workoutForm.elements.reps.value +
						"&weight=" + workoutForm.elements.weight.value + "&date=" + workoutForm.elements.date.value + "&lbs=" +
						workoutForm.elements.lbs.value;

	// Build new table row and execute Ajax callback event listener function.
	req.open("GET", targetPage + "?" + getParameters, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.addEventListener('load', function(){
	if(req.status >= 200 && req.status < 400){

		var response = JSON.parse(req.responseText);
		var id = response.workouts;	// Workout id.

		// Collect and Update DOM.
	    var table = document.getElementById("exerciseTable");	// See Citation 1 & 2.
		// Add row to end of table.
		var newRow = table.insertRow(-1); 						// See Citation 3.

		// Add each of the below elements to the row.

		// Id.
		var idElement = document.createElement('td');
		idElement.textContent = id;
		idElement.style.display = "none";						// See Citation 4.
		newRow.appendChild(idElement);

		// Name.
		var nameElement = document.createElement('td');
		nameElement.textContent = workoutForm.elements.workoutName.value;
		nameElement.style.textAlign = 'left';
		newRow.appendChild(nameElement);

		// Reps.
		var repElement = document.createElement('td');
		repElement.textContent = workoutForm.elements.reps.value;
		newRow.appendChild(repElement);

		// Weight.
		var weightElement = document.createElement('td');
		weightElement.textContent = workoutForm.elements.weight.value;
		newRow.appendChild(weightElement);

		// Kgs vs. Lbs.
		var LK_Element = document.createElement('td');
		LK_Element.textContent = workoutForm.elements.lbs.value;
		newRow.appendChild(LK_Element);

		// Date.
		var dateElement = document.createElement('td');
		dateElement.textContent = workoutForm.elements.date.value;
		newRow.appendChild(dateElement);

		// Edit Button.
		var editButton = document.createElement('td');
		editButton.innerHTML = '<a href="/editRow?id=' + id +'"><input type="button" value="Edit" id="edit"></a>';
		newRow.appendChild(editButton);

		// Delete Button.
		var deleteButton = document.createElement('td');
		deleteButton.innerHTML = '<input type="button" value="Delete" id="delete" onclick="deleteExercise(\'exerciseTable\', this, '+ id +')">';
		newRow.appendChild(deleteButton);

	} else {
		console.log('Error: AJAX GET request failed.');
	}
	});
	// Send the row.
	req.send(targetPage + "?" + getParameters);
});

/* Delete Button handler. */
function deleteExercise(woTable, row2bDeleted, rowId){
	var table = document.getElementById(woTable);
	var rowCount = table.rows.length;
	var req = new XMLHttpRequest();
	var targetPage = '/deleteRow';

    // GET Delete Request.
	req.open("GET", targetPage + "?id=" + rowId, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.addEventListener('load', function(){
		if(req.status >= 400){
			console.log('Error: AJAX Delete request failed.');
	}
	});
	req.send(targetPage + "?id=" + rowId);

	/* Iterate all rows to find and remove row2bDeleted in table. Double parentNode 
	to accomodate rowId hidden element -> table body -> table (called on table, 2 levels up,
	not the tr itself). */
	for(var i = 0; i < rowCount; i++){
		var row = table.rows[i];
		if(row == row2bDeleted.parentNode.parentNode){ 		// See Citation 5.
			table.deleteRow(i);
		}
	}
}

/* Used to prepolulate "Workout Date" field in home.handlebars form newExercise. See Citation 6, 7, & 8. */
function getTDate(){
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) {month = "0" + month};
	if (day < 10) {day = "0" + day};
	var today = String(year + "-" + month + "-" + day);
	return today;	
}

/* CITATIONS
[1] Adapted from http://stackoverflow.com/questions/22067769/how-to-append-a-row-to-html-table-using-dom
[2] Adapted from http://www.codeproject.com/Articles/26335/Append-rows-and-controls-into-a-table-element-with
[3] http://stackoverflow.com/questions/15866451/how-to-insert-row-at-end-of-table-with-htmltableelement-insertrow
[4] Adapted from http://stackoverflow.com/questions/18480319/document-getelementbyidtest-style-display-hidden-not-working
[5] http://www.w3schools.com/jsref/met_table_deleterow.asp
[6] https://piazza.com/class/ipg9pgicbxl5mk?cid=129
[7] http://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
[8] http://www.w3schools.com/jsref/jsref_string.asp
*/