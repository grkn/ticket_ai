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
  timeout: 60000,
  headers: {'Authorization': 'Bearer OKWQTVZCU7M2IDKQR5X2ZKVNWYKEAAJX'}
});

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
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
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Intent can not be created " + error.data);})
	
});

app.get('/intents', function(req,res) {
	restClient.get('/intents')
	.then(function(response) {res.send(response.data);})
	.catch(function(error) { res.send("Intent can not be retrieved " + error.data);})
	
});

app.delete('/intent', function(req,res) {
	let intentName = req.query.intentName;
	restClient.delete('/intents/' + intentName, {})
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Intent can not be deleted " + error.data);})
	
});

app.get('/answers', function(req,res) {
	const intentId = req.query.intentId;
	mongoDb.findByQuery('answers', { intent_id: intentId }, function(data) {
		res.send(data);
	});
});

app.post('/utterances', function(req,res) {
	const text = req.body.text;
	const intentName = req.body.intentName;
	const body = [{
		'text': text,
		'intent': intentName,
		'entities': [],
		'traits': []
	}];
	restClient.post('/utterances', body)
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Text is NOT created. " + error.data);})
});

app.get('/utterances', function(req,res) {
	const intentName = req.query.intents;
	restClient.get('/utterances?limit=100&intents=' + intentName)
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Text can not be received. " + error.data);})
});

app.get('/allUtterances', function(req,res) {
	restClient.get('/utterances?limit=1000')
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Text can not be received. " + error.data);})
});

app.delete('/utterances', function(req,res) {
	const text = req.query.text;
	restClient.delete('/utterances', { data : [{ 'text': text}]})
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Text can not be deleted. " + error.data);})
});

app.get('/message', function(req,res) {
	const message = req.query.message;
	restClient.get('/message?q=' + message)
	.then(function(response) {
	    const intents = response.data.intents;
		const arr = findByThreshold(intents, 0.7);
		if(intents.length === 0 || arr.length === 0) {
		   res.send({
				'message':{
					//fallback message
					'text' : 'Ooops I can not find anything!'
				}
		   });
		} else {
			let intent = findMostConfidentValue(arr);
			mongoDb.findByQuery('answers', { 'intent_id' : intent.id}, function(data) {
				const length = data.length;
				const answerIndex = randomIntFromInterval(0, length - 1)
				res.send({'message' : { text : data[answerIndex].text}});
			});
		}
  	    
	 })
	.catch(function(error) {res.send("Message response can not be received. " + error.data);})
})

function findByThreshold(arr, thresholdValue) {
	arr = arr.filter(item => item.confidence >= thresholdValue);
	return arr;
}

function findMostConfidentValue(arr) {
	arr = arr.sort((a,b) => a.confidence > b.confidence ? 1 : -1);
	return arr[0];
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const server = app.listen(8081, function () {
   let host = server.address().address
   let port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})