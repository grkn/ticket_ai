const express = require('express');
const app = express();
const axios = require('axios').default;
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const restClient = axios.create({
  baseURL: 'https://api.wit.ai',
  timeout: 5000,
  headers: {'Authorization': 'Bearer OKWQTVZCU7M2IDKQR5X2ZKVNWYKEAAJX'}
});

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
	let intentName = req.param('intentName');
	restClient.delete('/intents/' + intentName, {})
	.then(function(response) {res.send(response.data);})
	.catch(function(error) {res.send("Intent can not be deleted" + error.data);})
	
});

const server = app.listen(8081, function () {
   let host = server.address().address
   let port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})