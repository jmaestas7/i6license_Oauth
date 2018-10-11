//routes/user.js
const express = require('express');
const router = express();
const path = require("path");

router.engine('html', require('ejs').renderFile);
router.set('view engine', 'html');

router.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "..\\view\\index.html"));
});

module.exports = router;