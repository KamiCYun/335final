const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoUrl = 'mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.l1sgpqo.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
let db;



app.get('/', (req, res) => {
    res.render('index');
});
app.get('/weather-list', async (req, res) => {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try{
        await client.connect();
        const result = await client.db("CMSC335_DB").collection("WeatherData").find().toArray();
        res.render('weather-list', {weatherList: result});

    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }


});
app.post('/weather', (req, res) => {
    const city = req.body.city;
    const apiKey = 'f8439932213e99a87437be6142dfdb6c'; // Replace with your OpenWeatherMap API key
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    axios.get(url)
        .then( async response => {
            const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
            const weather = {
                city: city,
                temperature: response.data.main.temp,
                high: response.data.main.temp_max, // Storing high temperature
                low: response.data.main.temp_min, // Storing low temperature
                description: response.data.weather[0].description,
                date: new Date() // Storing the current date and time
            };
            const weather1 = {
                city: "test",
                temperature:"test",
                high: 20,
                low: 20,
                description:"test",
                date:new Date()
            }
            try{
                await client.connect();
                const result = await client.db("CMSC335_DB").collection("WeatherData").insertOne(weather)
                res.render('weather', {weather});
                console.log(`Document added with ID: ${result.name}`);
            }
            catch(e){
                console.error(e);
            }
            finally{
                await client.close();
            }
        })
        .catch(error => {
            console.log(error);
            res.render('index', { weather: null, error: 'Error, please try again' });
        });
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
});