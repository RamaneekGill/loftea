'use strict'

const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})


var HELP_TEXT = `help text`
let lang_wfh = require('./language/wfh.json')
let lang_sick = require('./language/sick.json')

//*********************************************
// Setup different handlers for messages
//*********************************************

// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  msg.say(HELP_TEXT)
})

// Working from home
slapp
  .message('(working from home)|(wfh)', ['direct_mention', 'direct_message'], (msg) => {
    msg.say(lang_wfh)
  
  var string = msg.body.event.text

  if (string.includes('confirmation')) {
    msg.say('Confirming with manager')
    if (string.includes('no')) {
      msg.say('denied')
    } else {
      msg.say('accepted')
    }
  }
  })
  .action('wfh_callback', (msg, text) => {
    msg.say('Okay, cancelling your work from home day today')
  })
  

// Sick days
slapp
  .message('^(sick day|sick)$', ['direct_mention', 'direct_message'], (msg, text) => {
      msg
        .say(lang_sick)
    })
  .action('sick_callback', (msg, text) => {
    msg.say('Okay, cancelling your sick day today')
  })



// Hello flows
slapp.message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
    msg.say(`${text}, how are you?`)
  })

// Thank you flows
slapp.message(/^(thx|thnx|thanks|thank you)/i, ['mention', 'direct_message'], (msg) => {
  msg.say([
    "You're welcome :smile:",
    'You bet',
    ':+1: Of course',
    'Anytime :sun_with_face: :full_moon_with_face:'
  ])
})

// Catch-all for any other responses not handled above
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})

// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
})
