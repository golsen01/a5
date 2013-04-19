// Express initialization
var express = require('express');
var app = express(express.logger());
app.use(express.bodyParser());
app.set('title', 'nodeapp');

// Mongo initialization
var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/scorecenter';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
	db = databaseConnection;
});

//shows all highscores submitted to the app in descending chronological order
app.get('/', function (request, response) {

	var startString = '<!DOCTYPE HTML><html><head><title>Grace The Scorekeeper</title></head><body><table><tr><th>Game</th><th>User</th><th>Score</th><th>Date</th></tr>';
	var endString = '</table></body></html>';

	db.collection('highscores', function(err, collection) {
		collection.find(request.query, function(err, collection){
			collection.toArray(function(err, collection){
				for(var i = collection.length - 1; i >=0; i--){		//places most recent score on top of list
					if(collection[i].game_title != null){
						startString += '<tr><td>'+ collection[i].game_title + '</td><td>' + collection[i].username + '</td><td>' + collection[i].score + '</td><td>' + collection[i].datetime + '</td></tr>';
					}
				}
				var compileString = startString + endString;

				response.set('Content-Type', 'text/html');
				response.send(compileString);
			});
		});

	});

});

//submits a new highscore for a game and specific user
app.get('/submit.json', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");			//these two lines are for CORS
	response.header("Access-Control-Allow-Headers", "X-Request");


	db.collection('highscores', function(err, collection){

		var username = request.query.username;
		var score = parseInt(request.query.score);
		var game_title = request.query.game_title;
		var d = new Date();
		var datestring = d.getMonth() + '/' + d.getDate() + '/' + d.getYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

		var toInsert = {"username":username, "score":score, "game_title":game_title, "datetime":datestring};

		collection.insert(toInsert, function(err, saved){
			if (err){
				response.send("Whoops failure");
			}
			else if (!saved){
				response.send("Not saved");
			}
			else{
				response.send(request.query);
			}
		});
	});
});

//shows the top 10 highscores from a specific game
app.get('/highscores.json', function(request, response){

	response.header("Access-Control-Allow-Origin", "*");			//these two lines are for CORS
	response.header("Access-Control-Allow-Headers", "X-Request");

	db.collection('highscores', function(err, collection){
		collection.find(request.query, function(err, collection){
			collection.sort({'score':-1}, function(err, collection){
				collection.limit(10, function(err, collection){
					collection.toArray(function(err, collection){
						var toReturn = '[';
						for (var i = 0; i < collection.length; i++){
							toReturn += JSON.stringify(collection[i]);
							if(i < collection.length - 1){
								toReturn += ','
							}
						}
						toReturn += ']';
						response.send(toReturn);
					});
				});
			});
		});
	});

});

//shows the highscores for a particular user
app.get('/usersearch', function(request, response){
	response.send('<form name="input" action="/" method="get">Username: <input type="text" name="username"><input type="submit" value="Submit"></form>');
})

//listening to port 5000
app.listen(process.env.PORT || 5000);
