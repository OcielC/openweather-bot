require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

// establishing the I/O port
const PORT = process.env.PORT || 3000
const app = express()

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.listen(PORT, () => console.log(`App is up and running listening on port ${PORT}`))

app.get('/', async (req, res) => {
  try {
    res.json({
      message: 'Welcome to Express Auth App!'
    })
  } catch (e) {
    res.status(e.status).json({
      message: e.status
    })
  }
})

app.post('/test', async (req, res) => {
  try {
    console.log(req.body)
    const data = {
      'response_type': 'in_channel',
      'text': `Testing testing 123! ${req.body.text}`
    }
    res.json(data)
  } catch (e) {
    console.log(e)
  }
})

async function openWeatherApi(query) {
  try {
    const url = 'https://api.openweathermap.org/data/2.5/weather'
    const apiKey = 'process.env.OPEN_WEATHER_API_KEY' // <-- using the env variable

    // make api request using axios
    const response = await axios.get(url, {
      params: {
        appid: apiKey,
        q: query,
        units: 'imperial'
      }
    })

    console.log(response)
    return response.data
  } catch (e) {
    console.log(e)
  }
}

app.post('/weather', async (req, res) => {
  try {
    console.log(req.body)

    //respond with an OK to sender within 3 secs
    // as required by Slack for delayed responses
    // documentation: https://api.slack.com/slash-commands#responding_response_url
    res.json()

    // extract city passed in as a parameter to
    // our slash command (/weather cityName)
    const query = req.body.text

    // making API request via openWeatherApi function
    const response = await openWeatherApi(query)

    // print out OpenWeather API
    // response to the console
    console.log(response)

    // Create a forecast based on info
    // received from OpenWeather
    const forecast = `Current temperature in ${query} is ${response.main.temp} degrees with a high of ${response.main.temp_max} degrees and a low of ${response.main.temp_min} degrees.`

    // construct an object (according to Slack API docs)
    // that will be used to send a response
    // back to Slack
    const data = {
      'response_type': 'in_channel',
      'text': forecast
    }

    // make a POST request (with axios) using "response_url"
    // to complete our "delayed response" as
    // per the Slack API docs
    axios.post(req.body.response_url, data)

    // res.json(data)
  } catch (e) {
    console.log(e)
  }
})