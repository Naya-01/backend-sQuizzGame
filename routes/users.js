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
/* GET users listing. */
router.get('/email/:email', async function(req, res, next) {
    const result =  await userModel.getUserByEmail(req.params.email);
    if(!result) res.sendStatus(400).end();
    res.send(result);
    //await userModel.getUserById(res, req.params.id);
});


router.post('/register', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("name")&& req.body.name.length === 0) ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0) ||
        (req.body.hasOwnProperty("password")&& req.body.password.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.register(req.body);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});


router.post('/login', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0) ||
        (req.body.hasOwnProperty("password")&& req.body.password.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.login(req.body);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

router.post('/subscribe', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0) ||
        (req.body.hasOwnProperty("id_follower")&& req.body.id_follower.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.followUser(req.body.id_user,req.body.id_follower);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});



module.exports = router;
