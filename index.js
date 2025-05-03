const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

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

let persons = [
  { 
    id: 1,
    name: "Arto Hellas", 
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace", 
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov", 
    number: "12-43-234345"
  },
  { 
    id: 4,
    name: "Mary Poppendieck", 
    number: "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) =>{
  const entradas =`<p>Phonebook has info for ${persons.length+1} people</p>`
  const espacio = '<br>';
  const now = new Date();
  const formattedDate = `<p>${now.toString()}</p>`
  const mensajeEntero = entradas+espacio+formattedDate;
  response.send(mensajeEntero);

});

app.get('/api/persons/:id', (request, response) => {
  const id= Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if(person){
    response.json(person);
  }else{
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !==id);

  response.status(204).end();
})

const generateId = () => {
  const randomId = Math.floor(Math.random()*1000)+1;
  return randomId;
};

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if(!body.name){
    return response.status(400).json({
      error: 'content missing'
    });
  };
  if(!body.number){
    return response.status(400).json({
      error: 'content missing'
    });
  };

  if(persons.some(person => person.name === body.name)){
    return response.status(400).json({
        error: 'name must be unique'
    });
  }

  const person = {
    name:body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person);

  response.json(person);
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>{
  console.log(`Server running on port ${PORT}`);
})
