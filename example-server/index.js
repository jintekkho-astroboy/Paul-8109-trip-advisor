// require will load in a JavaScript package
// the first parameter of require must be a folder in the node_modules folder
const express = require('express');

// create a new express application
const app = express();

// tell express to expect JSON data
app.use(express.json());

// a route is a url paired with a function
// when the server recieves a request for a route's url,
// the function associated with it will be called
app.get("/", function(req, res){
    res.send("Hello world");
})

// (parameter 1): req = request
// (parameter 2(: res = response
app.get("/about-us", function(req,res){
    res.send("about us");
})

// /hello/:name - the :name is a parameter (it's like a placeholder)
// /hello/paul, then the :name is "paul"
app.get("/hello/:name", function(req,res){
    // to access a route paramete, we use req.params
    const name = req.params.name;
    res.send("Hello, " + name);
})

// via query strings
// api.com/v1/search?name=paul&role=manager&id=3
//  {
//      "name":"paul",
//      "role":"manager",
//       "id": "3"
// }
// 
app.get('/search', function(req,res){
    // query strings will be changed into an object and stored in req.query
    const searchCritera = req.query;
    console.log(searchCritera);
    res.send("Processing search");
});

app.post("/process-form", function(req,res){
    // when dealing with POST,
    // we get the data from req.body
    console.log(req.body);
    res.send("Processing data")
})


// Start the server at port 3000
app.listen(3000, function(){
    console.log("Server has started");
})