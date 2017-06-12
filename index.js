'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || '5000'))

// Allow us to process data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES
app.get('/', function(req, res) {
	res.send("Hi I'm a chatbot")

})

let token = "EAAbEYXYiyTkBALYbip5vIuPOy3y47E47aFEjSpazVcwmZAt4e7MA3qGBXd3gtBP64TIeQwfbOWv68hje7jZC9P5euZAJZAL1ufinZClyjUkoMf4xIKbln8pv1ZAJBQ2rg2qcS1vxSWN4Q7lkrNEMJ5ZAH5HDZCZAnE4fz7YwjvrJirwZDZD"

// Facebook
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] == 'hello_app') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Wrong token')
})

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
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
		sendGenericMessage(sender)
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

function sendGenericMessage(sender, text) {
	let messageData = {
		"attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"generic",
	        "elements":[
	           {
	            "title":"I love Winter",
	            "image_url":"http://az616578.vo.msecnd.net/files/2016/01/30/635897108712065484-1787440828_winter.jpg",
	            "subtitle":"I love winter.",
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

app.listen(app.get('port'), function() {
	console.log('running: port')
})
