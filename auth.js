const argon2 = require("argon2");

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (req, res, next) => {
  argon2
    .hash(req.body.password, hashingOptions)
    .then((hashedPassword) => {
      // Envoyer le mot de passe haché dans la base de données
      User.create({ hashedPassword })
        .then(() => {
          // Supprimer le mot de passe en clair du corps de la requête
          delete req.body.password;

          next();
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const jwt = require("jsonwebtoken");

const verifyPassword = (req, res) => {
  argon2

    .verify(req.user.hashedPassword, req.body.password)

    .then((isVerified) => {
      if (isVerified) {
        const payload = { sub: req.user.id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        delete req.user.hashedPassword;

        res.send({ token, user: req.user });
      } else {
        res.sendStatus(401);
      }
    })

    .catch((err) => {
      console.error(err);

      res.sendStatus(500);
    });
};

const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }

    req.payload = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    console.error(err);

    res.sendStatus(401);
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  verifyToken,
};
