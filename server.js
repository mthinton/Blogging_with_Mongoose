const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {DATABASE_URL, PORT} = require('./config');
const entry = require ('./models');
const User = require('./users');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

app.post('/users', (req, res) => {
	const document = new User()
	document.name = 'Matthew';

	document.save( (err, user) => {
		if(err){
			res.send(err);
		}
		res.json(user);
	})
})

app.get('/posts', (req, res) => {
  entry
    .find({})
    .exec()
    .then(posts => {
    	console.log(posts);
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

app.post('/posts', (req, res) => {
	const document = new entry()
	document.author.firstName = 'Matt';
	document.author.lastName = 'Hinton';
	document.content = 'some cool words';
	document.title = 'Discovering';

	document.save( (err, doc) => {
		if(err){
			res.send(err)
		}
		res.json(doc);
	})
})

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl='mongodb://localhost:27017/blogposts', port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};