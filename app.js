var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');
var app = express();

https.createServer({
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
}, app).listen(3000, function () {
	console.log('Example Storefront server started.');
	console.log('Visit https://localhost:3000');
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/checkout', function (req, res) {
    console.log("##### PAYMENT REQUEST INCOMING ######");
    console.log(req.body);

    //Simulate failure if security code is '000'
    if(req.body.details.cardSecurityCode === "000") {
      console.log("going to fail");
      res.statusCode = 400;
    }

    //Simulate processing
    setTimeout(function() {
      //Respond with a nonsense payment ID
      res.send({ paymentId: Math.random().toString(36) });
    }, Math.random() * 5000);
});