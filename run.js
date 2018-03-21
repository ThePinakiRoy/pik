var elements = require('./elements');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var weather = require('./agents/yahoo-weather')
app = express();
app.use(cors())
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// get an instance of router
var router = express.Router();
app.use('/', router);
app.use(express.static(__dirname + "/"));

// route middle-ware that will happen on every request
router.use(function (req, res, next) {
    // log each request to the console
    console.log(req.method, req.url + " logging all requests");
    // continue doing what we were doing and go to the route
    next();
});

// home page route for port 5000, gets executed when entering localhost:5000
// and redirects to index.html (correctly and as expected)
router.get('/', function (req, res) {
    console.log("routing from route")
    res.redirect('index.html');

});



// This gets executed when my url is: http://localhost:5000/test
// and redirects to index.html (the questions is why!? I thought
// all the requests to root route would be caught by the router instance

app.get('*', function (req, res) {
    console.log('redirecting to index.html');
    res.redirect('/index.html');
});

app.post('/webhook', function (req, res) {
    console.log("received something")
    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action + ' ';
                    console.log('speech -----', speech)

                }

                var parameters = requestBody.result.parameters;
                
                    var response = elements.response;
                    res= runAgents(parameters, requestBody);
                        console.log('res -----', res)
                        // response.speech =res;
                        // response.displayText = response.speech ;
                        // console.log('msg ' + response.speech)
                        // console.log('displayText ' + response.displayText)
                        // console.log('result: ', response.speech );
                        return res.json(response);
                   
                   
               
                

            }
        }

        

    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

app.listen((process.env.PORT || 5000), function () {
    console.log("Server listening port 5000");
});


/* weather agent start*/
// async function weatherAgent(param, valOfP) {
//     try {
//         var formatedMessage = "";
//         var data = "";
//         if (param == 'geo-city') {
//             await weather.getSimpleWeather(valOfP).then(function (res) {
//                 formatedMessage = getMessage(res.weather);
//                 console.log('formatedMessage ' + formatedMessage)
//                 return formatedMessage;
//             });
//         }
//         return formatedMessage;
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function getMessage(_weather) {
//     var _msg = 'Current condition will be ' + _weather.condition + ' with temparature of ' + _weather.temperature.value + ' °' + _weather.temperature.units;
//     console.log(_msg)
//     return _msg;
// }
async function runAgents(parameters, requestBody) {
    console.log('starting run agent');
    try {
        if (parameters) {
            for (var p in parameters) {
                if (parameters.hasOwnProperty(p)) {
                    // speech += p + ": " + parameters[p] + "; ";
                    var _action = requestBody.result.action;
                    console.log(_action)
                    if (_action == 'yahooWeatherForecast') {
                        console.log('start weather api')

                        if (p == 'geo-city') {
                            await weather.getSimpleWeather(parameters[p]).then(function (resl) {
                                formatedMessage = 'Current condition will be ' + resl.weather.condition + ' with temparature of ' + resl.weather.temperature.value + ' °' + resl.weather.temperature.units;
                                //formatedMessage = getMessage(resl.weather);
                                console.log('formatedMessage ' + formatedMessage)
                                return formatedMessage;

                            });

                            break;
                        }

                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}