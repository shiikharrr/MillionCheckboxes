const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const users = require("./users");

const JWT_SECRET =
  process.env.JWT_SECRET || "secretkey";

function register(req, res) {

  try {

    const { username, password } =
      req.body;

    if (!username || !password) {

      return res.status(400).json({
        error:
          "Username and password required"
      });
    }

    const existingUser =
      users.find(
        (user) =>
          user.username === username
      );

    if (existingUser) {

      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword =
      bcrypt.hashSync(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword
    };

    users.push(newUser);

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username
      },
      JWT_SECRET
    );

    res.json({
      token
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Registration failed"
    });
  }
}

function login(req, res) {

  try {

    const { username, password } =
      req.body;

    const user = users.find(
      (user) =>
        user.username === username
    );

    if (!user) {

      return res.status(400).json({
        error: "User not found"
      });
    }

    const validPassword =
      bcrypt.compareSync(
        password,
        user.password
      );

    if (!validPassword) {

      return res.status(400).json({
        error: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      JWT_SECRET
    );

    res.json({
      token
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Login failed"
    });
  }
}

module.exports = {
  register,
  login
};