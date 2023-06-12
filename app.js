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

app.post("/api/users", movieHandlers.postUser);

app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);

app.use(verifyToken);

app.post("/api/movies", verifyToken, movieHandlers.postMovie);
app.put("/api/movies/:id", verifyToken, movieHandlers.updateMovie);
app.delete("/api/movies/:id", verifyToken, movieHandlers.deleteMovie);
app.put("/api/users/:id", verifyToken, movieHandlers.updateUser);
app.delete("/api/users/:id", verifyToken, movieHandlers.deleteUser);

/* const isItDwight = (req, res) => {
  if (
    req.body.email === "dwight@theoffice.com" &&
    req.body.password === "123456"
  ) {
    res.send("Credentials are valid");
  } else {
    res.sendStatus(401);
  }
}; */

const userHandlers = require("./userHandlers");
const { hashPassword, verifyPassword, verifyToken } = require("./auth.js");

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
