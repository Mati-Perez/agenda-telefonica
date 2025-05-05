require('dotenv').config()
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const Person = require('./models/person');

app.use(express.json());
app.use(express.static('dist'));
app.use(cors());

app.use(morgan((tokens, req, res) => {
  const log = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    req.method === 'POST' ? `Body: ${JSON.stringify(req.body)}` : ''
  ].join(' | ');
  return log;
}));


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons =>{
    response.json(persons);
  })

});

app.get('/api/persons/:id', (request, response) =>{

  Person.findById(request.params.id).then(person=>{
    response.json(person);
  });
});

app.post('/api/persons', (request, response) =>{
  const body = request.body;
  if(!body.name){
    console.log('sin cuerpo');
    return response.status(400).json( {error: 'content missing' });
  };

  if(!body.number){
    console.log('sin numero');
    return response.status(400).json( {error: 'content missing' });
  };

  const person = new Person({
    name: body.name,
    number: body.number,
    });

    person.save()
      .then(savedPerson =>{response.json(savedPerson)
      .catch(error => response.status(500).json({ error: 'server error' }))
    }).catch(error => response.status(500).json({ error: 'server error' }))

});

app.delete('/api/persons/:id', (request, response, next) =>{
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end();
  })
  .catch(error => {
    next(error)
  });
  
});

app.put('/api/persons/:id', (request, response, next) =>{
  const body= request.body;

  const person={
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
  .then(updatedPerson => {
    response.json(updatedPerson);
  })
  .catch(error => next(error))
});

app.get('/info', async(request, response) =>{
  try{
    const count = await Person.countDocuments({});
    const now = new Date();

    const mensajeEntero= 
      `<p>Phonebook has info for ${count} people</p>
      <br>
      <p>${now.toString()}</p>`;
    response.send(mensajeEntero);
  }catch(error){
    response.status(500).json({ error: 'Server error '});
  }

});



const unknownEndpoint = (request, response) => {
  response.status(404).send( { error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) =>{
  console.log(error.message);

  if(error.name==='CastError'){
    return response.status(400).send({ error: 'malformatted id' });
  }
  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () =>{
  console.log(`Server running on port ${PORT}`);
})
