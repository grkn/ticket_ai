const express = require('express');
const app = express();
const axios = require('axios').default;
const cors = require('cors');
const { MongoClient } = require('mongodb');
let MongoQueries = require('./mongoQueries');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const restClient = axios.create({
  baseURL: 'https://api.wit.ai',
  timeout: 5000,
  headers: {'Authorization': 'Bearer OKWQTVZCU7M2IDKQR5X2ZKVNWYKEAAJX'}
});

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'ticket_db';
let mongoDb;

async function connectMongoDb() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  mongoDb = new MongoQueries(client);
  return 'done.';
}

connectMongoDb()
  .then(console.log)
  .catch(console.error);


app.get('/', function (req, res) {
   res.send('Hello World');
})

app.post('/intent', function(req,res) {
	let intentName = req.body.intentName;
	restClient.post('/intents', {
		"name" : intentName
	})
	.then(function(response) {res.send("Intent created successfully");})
	.catch(function(error) { res.send("Intent can not be created" + error.data);})
	
});

app.get('/intents', function(req,res) {
	restClient.get('/intents')
	.then(function(response) {res.send(response.data);})
	.catch(function(error) { res.send("Intent can not be retrieved" + error.data);})
	
});

app.delete('/intent', function(req,res) {
	let intentName = req.query.intentName;
	restClient.delete('/intents/' + intentName, {})
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Intent can not be deleted" + error.data);})
	
});

app.get('/answers', function(req,res) {
	const intentId = req.query.intentId;
	console.log(intentId);
	mongoDb.findByQuery('answers', { intent_id: intentId }, function(data) {
		console.log(data);
		res.send(data);
	});
});

const server = app.listen(8081, function () {
   let host = server.address().address
   let port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})