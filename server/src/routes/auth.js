const express = require("express");
const router = express.Router();
const { login, verifyToken } = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

router.post("/login", login);
router.get("/verify", authMiddleware, verifyToken);

module.exports = router;
