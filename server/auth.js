const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const users = require("./users");

const router = express.Router();

const JWT_SECRET = "super-secret-key";

// =======================
// REGISTER
// =======================

router.post(
  "/register",
  express.json(),
  async (req, res) => {

    const {
      username,
      password,
    } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        message:
          "Username and password required",
      });
    }

    // Check existing user
    const existingUser =
      users.find(
        (user) =>
          user.username === username
      );

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: crypto.randomUUID(),

      username,

      password: hashedPassword,
    };

    users.push(user);

    res.json({
      message:
        "User registered successfully",
    });
  }
);

// =======================
// LOGIN
// =======================

router.post(
  "/login",
  express.json(),
  async (req, res) => {

    const {
      username,
      password,
    } = req.body;

    // Find user
    const user =
      users.find(
        (u) =>
          u.username === username
      );

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    // Compare password
    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,

        username: user.username,
      },

      JWT_SECRET,

      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
    });
  }
);

module.exports = router;