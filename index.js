const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();
const listOfNumbers = [];

app.use(bodyParser.urlencoded({ extended: false }));


app.post('/', (req, res) => {
  const twiml = new MessagingResponse();
  const RYUFACTS = ['Did you know the average Ryu spends almost 40% of the day on the toilet?',
  'Ryu fact 2']
  console.log(req.body.From);

  if (req.body.Body.toLowerCase() === 'subscribe') {
    listOfNumbers.push(req.body.From)
    let trialString = '-------------------\n'
    let retString = trialString
    + 'Thank you for subscribing to Ryu Facts.\n'
    + 'Current subscribers:\n';

    listOfNumbers.forEach(function(element) {
      retString += element;
      retString += '\n'
    });

    twiml.message(retString);
  } else {
    let trialString = '-------------------\n'
    let retString = trialString + RYUFACTS[Math.floor(Math.random()*RYUFACTS.length)];
    twiml.message(retString);
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000');
});
