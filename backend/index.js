const express = require('express');
// read the content of the .env file and put into
// an object named process.env
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

// process.env exists in all NodeJS application
// it's a system level object
// process - refers to the program running in the operating system
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// initialzie the google genai
const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
})

// create express application
const app = express();

// enable JSON processing
app.use(express.json());

// all routes must be defined before app.listen
app.get("/live", function (req, res) {
    res.send("Still alive");
})

app.post('/gemini/chat', async function (req, res) {
    try {
        const userMessage = req.body.userMessage;
        const prompt = `You are a helpful assistant. User asks: ${userMessage}`;
        // ai is the GoogleGenAI object
        // generateContent is to get a response from the Gemini LLM
        // see: https://ai.google.dev/gemini-api/docs/models for available models
        const response = await ai.models.generateContent({
            model: process.env.MODEL || "gemini-2.5-flash",
            contents: prompt
        })

        const reply = response.candidates[0].content.parts[0].text;
        res.json({
            "reply": reply
        });
    } catch (e) {
        console.log(e);
        res.send("AI encountered error");
    }


})

app.post('/gemini/trip-advisor', async function (req, res) {
    const userMessage = req.body.userMessage;
    const lat = req.body.lat;
    const lng = req.body.lng;

    const prompt = `
        You are a professional travel advisor. The user is located at
        latitude ${lat} and longitude {$lng}.
        The user asks: ${userMessage}
        INSTRUCTIONS
        1. You MUST use Google Maps tool to look up real, currently operating places
        2. You MUST include every place returned by the Google map tool as an entry
        3. For each place, copy its EXACT NAME , address and coordinates from the Google Map results
        Do not paraphrase name, address and coordinates. Do not guess the coordinates or not address
        4. List the places in location in the same order they appear in google map rounding resulsts
        so that locations[i] matches grounding chunks[i]

        Respond only with a RAW JSON object (no markdow, no code fences), in the form of

        {
        "locations": [
                {
                "name": "Exact place name from Google Maps",
                "lat": 1.234,
                "lng": 103.456,
                "description": "Short description grounded in the Maps result",
                "address": "Full address from Google Maps"
                }
            ]
        }
    
    `

    try {
        const response = await ai.models.generateContent({
            model: process.env.MODEL || "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{
                    googleMaps: {}
                }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: Number(lat),
                            longitude: Number(lng)
                        }
                    }
                }
            }
        })

        let content = response.candidates[0].content.parts[0].text;
        // JSON.parse() will convert a JSON string into a JSON object
        console.log(content);
        const jsonContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const groundingSupport = response.candidates[0].groundingMetadata.groundingChunks;

        res.json({
            locations: jsonContent,
            groundingSupports: groundingSupport
        });
    } catch (e) {
        console.log(e);
        res.json({
            "error": e
        })
    }


})

// app.listen should always be the last thing in your index.js
app.listen(process.env.PORT || 3000, function () {
    console.log("Server is listening at port 3000");
})JSON.parse(