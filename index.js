const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fs = require('fs')
const app = express();

// add last minute error handling
process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Fatal error - Node NOT Exiting...");
});

// set up app
app.use(bodyParser.urlencoded({ extended: false }));

// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
// const accountSid = 'AC5bb7a87eb827accb99cf3d8b44297f3b';
// const authToken = '128e9c96661f7285cae57bceefee708c';
const client = require('twilio')(accountSid, authToken);

// logging!
var trueLog = console.log;
console.log = function(msg) {
  var tempDate = new Date().toISOString();
  var logMsg = tempDate + '\r\n' + msg +'\r\n';
  fs.appendFile("./log.log", logMsg, function(err) {
      if(err) {
          return trueLog(err);
      }
  });
  trueLog(msg);
}



// load ryu facts from JSON file
const RYUFACTS = JSON.parse(fs.readFileSync('./RyuFacts.json', 'utf8'));
// every 30 mins
// const TEXTTIMER = 1800000;
// every ~1 min
const TEXTTIMER = 50000;

var FACTSINDEX = 0;

// hold our list of numbers in memory and pre load some
// var listOfNumbers = [
//   {
//     name: 'Nate',
//     number: '+17033036393'
//   },
//   {
//     name: 'Kolby',
//     number: '+17039990556'
//   }
//
// ];

// hold our list of numbers in memory and pre load some
var listOfNumbers = [
  {
    name: 'Nate',
    number: '+17033036393'
  }
];
// root post route
app.post('/', (req, res) => {
  const twiml = new MessagingResponse();

  console.log('--- RECEIVING --- from [ ' + req.body.From + ']'
    + '\r\n'
    + req.body.Body);
  // subscribe message and logic
  if (req.body.Body.toLowerCase() === 'subscribers') {
    // listOfNumbers.push(req.body.From)
    let retString = 'Here is the current directory:\n';

    listOfNumbers.forEach(function(element) {
      retString += element.number + ' ' + element.name;
      retString += '\n'
    });

    twiml.message(retString);
  }

  // subscribe message and logic
  else if (req.body.Body.toLowerCase() === 'hep') {
    console.log('--- INFO --- from [ ' + req.body.From + ']'
      + '\r\n'
      + req.body.From
      + ' is trying to unsubscribe');


    let retString = 'Are you sure you want to cancel? That would make Ryu sad.\n'
    + '< Type [yes] to unsubscribe >\n';
    twiml.message(retString);
  }

  // epic troll logic
  else if (req.body.Body.toLowerCase() === 'yes') {
    console.log('--- INFO --- from [ ' + req.body.From + ']'
      + '\r\n'
      + req.body.From
      + ' got served LOL');

    let retString = 'COMMAND NOT RECOGNIZED\n'
    + 'Sorry about that! Here is a Ryu Fact:\n'
    + '-------------------\n'
    + RYUFACTS[Math.floor(Math.random()*RYUFACTS.length)].fact
    + '\n';
    twiml.message(retString);
  }

  // help text
  else if (req.body.Body.toLowerCase() === 'bar') {
    console.log('--- INFO --- from [ ' + req.body.From + ']'
      + '\r\n'
      + req.body.From
      + ' is checking help menu');


    let retString = 'Recognized commands:\n'
    + 'hep - unsubscribe\n'
    + 'bar - help menu\n'
    + 'subscribers - list all current subscribers\n'
    + 'cred - mentions\n'
    + '[everything else] - receive a cool new fact!\n';
    twiml.message(retString);
  }

  // credits text
  else if (req.body.Body.toLowerCase() === 'cred') {
    console.log('--- INFO --- from [ ' + req.body.From + ']'
      + '\r\n'
      + req.body.From
      + ' is checking credits');


    let retString = 'cred:\n'
    + 'created by nate using Node.js and Twilio\n'
    + 'git repo - https://github.com/nateblaine/ryu_facts\n'
    + 'facts provided by tFoRF (the Friends of Ryu Foundation) - thomas, kieran, will\n'
    + 'cred - mentions\n'
    + '[everything else] - receive a cool new fact!\n';
    twiml.message(retString);
  }

  // add logic
  else if (req.body.Body.toLowerCase().includes('add')) {
    console.log('--- INFO --- from [ ' + req.body.From + ']'
      + '\r\n'
      + req.body.From
      + ' is trying to add a new user.');

    // do this in the AM - add logic to regex a num and add to array

    let retString = 'User added\n'
    + '-------------------\n'
    + 'Here is the current directory:\n';

    listOfNumbers.forEach(function(element) {
      retString += element.number + ' ' + element.name;
      retString += '\n'
    });
    twiml.message(retString);
  }


  // default just send fact
  else {
    // pull random fact from list
    let retString = RYUFACTS[Math.floor(Math.random()*RYUFACTS.length)].fact;

    // set message for twilio
    twiml.message(retString);
  }

  // send response to Twilio and send SMS
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// function to text people from list of numbers automatically
function autoText(){
  // loop through list of nums and send text
  setInterval(function () {
    // pull random fact from list
    let retString = RYUFACTS[Math.floor(Math.random()*RYUFACTS.length)].fact;

    listOfNumbers.forEach(function(phoneNumber) {
      console.log("--- SENDING --- [AUTO-TEXT-FACT] message to " + phoneNumber.number + " [ " + phoneNumber.name + " ]");
      var message = client.messages.create({
        body: retString,
        from: '+17034203441',
        to: phoneNumber.number
      })
      .then(console.log(retString))
      .done();
    });
  }, TEXTTIMER);

}

// useful for sending one-off facts
function sendFact(phoneNumber){
  // send a starter fact
  retString =  + RYUFACTS[Math.floor(Math.random()*RYUFACTS.length)].fact;
  console.log("--- SENDING --- [STARTER-FACT] message to " + phoneNumber.number + " [ " + phoneNumber.name + " ]");
  var message = client.messages.create({
    body: retString,
    from: '+17034203441',
    to: phoneNumber.number
  })
  .then(console.log(retString))
  .done();
}

// message to send when first starting the app
function welcomeMessage(){
  // pull random fact from list
  let retString =  'Thanks for signing up for Ryu Facts! You will now receive a fun and cool Ryu Fact every < 30 > minutes.\n'
    + '< To stop receiving Ryu Facts, reply [hep]. For list of commands, reply [bar]. >'

  listOfNumbers.forEach(function(phoneNumber) {
    // send welcome
    console.log("--- SENDING --- [WELCOME] message to " + phoneNumber.number + " [ " + phoneNumber.name + " ]");
    var message = client.messages.create({
      body: retString,
      from: '+17034203441',
      to: phoneNumber.number
    })
    .then(console.log(retString))
    .done();

    // sleep for a second to make our texts go in order
    setTimeout(function() {
      // send a starter fact
      retString = RYUFACTS[Math.floor(Math.random()*RYUFACTS.length)].fact;
      console.log("--- SENDING --- [STARTER-FACT] message to " + phoneNumber.number + " [ " + phoneNumber.name + " ]");
      var message = client.messages.create({
        body: retString,
        from: '+17034203441',
        to: phoneNumber.number
      })
      .then(console.log(retString))
      .done();
    }, 3000);

  });
}

// start server and trigger our calls
http.createServer(app).listen(3000, () => {
  console.log('App Started Listening at port 3000');

  welcomeMessage();
  autoText();
});

// helper methods
