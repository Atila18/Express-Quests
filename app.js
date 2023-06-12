require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json()); // add this line

const port = process.env.APP_PORT ?? 5000;

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

const movieHandlers = require("./movieHandlers");

app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", movieHandlers.getUsers);
app.get("/api/users/:id", movieHandlers.getUsersById);

app.post("/api/movies", movieHandlers.postMovie);
app.post("/api/users", movieHandlers.postUser);

app.put("/api/movies/:id", movieHandlers.updateMovie);
app.put("/api/users/:id", movieHandlers.updateUser);

app.delete("/api/movies/:id", movieHandlers.deleteMovie);
app.delete("/api/users/:id", movieHandlers.deleteUser);

const { hashPassword } = require("./auth.js");

app.post("/api/users", hashPassword, (req, res, next) => {
  userHandlers.postUser(req, res, (err) => {
    // Supprimer le mot de passe haché du corps de la réponse
    if (!err) {
      delete req.body.hashedPassword;
    }
    next(err);
  });
});

app.put("/api/users/:id", hashPassword, (req, res, next) => {
  userHandlers.updateUser(req, res, (err) => {
    // Supprimer le mot de passe haché du corps de la réponse
    if (!err) {
      delete req.body.hashedPassword;
    }
    next(err);
  });
});

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
