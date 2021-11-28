var express = require('express');
var router = express.Router();
const { User } = require("../model/user");
const userModel = new User();
const db = require('../db')

/* GET users listing. */
router.get('/:id', async function(req, res, next) {
    const result =  await userModel.getUserById(req.params.id);
    if(!result) res.sendStatus(400).end();
    res.send(result);
   //await userModel.getUserById(res, req.params.id);
});


router.post('/register', async function(req, res, next) {
  if(
      !req.body ||
      (req.body.hasOwnProperty("name")&& req.body.name.length === 0) ||
      (req.body.hasOwnProperty("email") && req.body.email.length === 0) ||
      (req.body.hasOwnProperty("password")&& req.body.name.length === 0)
  )
    return res.status(400).end();

   await userModel.addUser(req.body);
});


module.exports = router;
