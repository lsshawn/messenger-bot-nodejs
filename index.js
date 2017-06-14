'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

var Config = require('./config')
var FB = requires('./connectors/facebook')

const app = express()

app.set('port', (process.env.PORT || '5000'))

// Allow us to process data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// index page
app.get('/', function(req, res) {
	res.send("Hi I'm a chatbot")

})

// verify Facebook App Webhook
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] == Config.FB_VERIFY_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Wrong token')
})

// to send messages to facebook
app.post('/webhook/', function(req, res) {
	var entry = FB.getMessageEntry(req.body)
	let messaging_events = entry[0].messaging
	for (let i=0; i<messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			decideMessage(sender, text)
			//sendText(sender, "Text echo: " + text.substring(0, 100))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			decideMessage(sender, text)
			continue
		}
	}
	res.sendStatus(200)
})

function decideMessage(sender, text1) {
	let text = text1.toLowerCase()
	if (text.includes("summer")) {
		sendImageMessage(sender, "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/CathedralofLearningLawinWinter.jpg/260px-CathedralofLearningLawinWinter.jpg")
	} else if (text.includes("winter")) {
		sendGenericMessage(sender, "http://rvsrfun.org/wp-content/uploads/2016/11/winter-rving.jpeg")
	} else if (text.includes("python me")) {
		sendText('BRB, executing script')
	} else {
		sendText(sender, "I like Fall")
		sendButtonMessage(sender, "What is your favorite season?")
	}
}

function sendText(sender, text) {
	let messageData = {text: text}
	sendRequest(sender, messageData)
}

function sendButtonMessage(sender, text) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text": text,
				"buttons":[
				  {
				    "type": "postback",
				    "title": "Summer",
				    "payload": "summer"
				  },
				  {
				    "type": "postback",
				    "title": "Winter",
				    "payload": "winter"
				  }
				]
			}
		}
	}
	sendRequest(sender, messageData)
}
 
function sendImageMessage(sender, imageURL) {
	let messageData = {
		"attachment": {
			"type":"image",
			"payload":{
				"url": imageURL
			}	
		}
    }
    sendRequest(sender, messageData)
}

function sendGenericMessage(sender, imageURL) {
	let messageData = {
		"attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"generic",
	        "elements":[
	           {
	            "title": "Winter",
	            "image_url": imageURL,
	            "subtitle": "I love winter.",
	            "buttons":[
	              {
	                "type":"web_url",
	                "url":"https://en.wikipedia.org/wiki/Winter",
	                "title":"More about winter!"
	              }              
	            ]      
	           }
	        ]
	      }
	  	}
	}
	sendRequest(sender, messageData)
}

function sendRequest(sender, messageData) {
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

// run server
app.listen(app.get('port'), function() {
	console.log('Running on port', app.get('port'))
})
