require('./config/config');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT;
      
app.use(bodyParser.json());

app.post('/todos', (request, response) => {
    var todo = new Todo({
       text: request.body.text,
       completed: request.body.completed,
        completedAt: request.body.completedAt
    });
    
    todo.save().then((doc) =>{
        response.send(doc);
    }, (e) => {
        response.status(400).send(e);
    });
});


//Get /todos
app.get('/todos', (request, response) => {
   Todo.find().then( (todos) => {
       response.send({
           todos
       });
   }, (e) => {
       response.staus(400).send(e);
   }) 
});

//Get /todos/id
app.get('/todos/:id', (request, response) => {
    var id = request.params.id;
    if(!ObjectID.isValid(id)){
        return response.status(404).send();
    }
    
    Todo.findById(id).then( (todo) => {
        if(!todo){
            return response.status(404).send();
        }
        response
            .status(200)
            .send({todo});
    }, (e) => {
        response.status(400).send();
    });
});

app.delete('/todos/:id', (request, response) => {
    var id = request.params.id;
    if(!ObjectID.isValid(id)){
        return response.status(404).send();
    }
     Todo.findByIdAndRemove(id).then( (todo) => {
        if(!todo){
            return response.status(404).send();
        }
        response
            .status(200)
            .send({todo});
    }, (e) => {
        response.status(400).send();
    });
});

app.patch('/todos/:id', (request, response) => {
   var id = request.params.id;
   var body = _.pick(request.body, ['text', 'completed']);
     
    if(!ObjectID.isValid(id)){
        return response.status(404).send();
    }
    
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then( (todo) =>{
        if(!todo){
            return response.status(400).send();
        }
        response.send({todo});
    }).catch((e) => {
        response.status(400).send();
    });
});

app.post('/users', (request, response) => {
   var body = _.pick(request.body, ['email', 'password']);
    var user = new User (body);
    
    user.save().then( () => {
      
        return user.generateAuthToken();
    }).then( (token) => {
       
        response.header('x-auth', token).send(user);
        
    }).catch( (e) => {

        response.status(400).send(e);
    });
});
app.listen(port, () => {
   console.log(`Started on port ${port}`) ;
});

module.exports = {app};