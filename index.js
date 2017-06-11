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
app.get('/webhook', function(req, res) {
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
			sendText(sender, "Text echo: " + text.substring(0, 100))
		}
	}
	res.sendStatus(200)
})


function sendtext(sender, text) {
	let messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: token},
		method: "POST",
		json: {
			receipt: {id: sender},
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
