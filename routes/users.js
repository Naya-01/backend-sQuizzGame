var express = require('express');
var router = express.Router();
const { User } = require("../model/user");
const userModel = new User();
const db = require('../db');
const { authorize } = require('../utils/authorize');


/* GET all users. */
router.get('/', authorize,async function(req, res, next) {//utilisé userlibrary
    if(!req.user.is_admin) res.sendStatus(409).end();
    const result =  await userModel.getAllUsers();
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* GET an user by email with all his subscriptions and subscribers */
router.get('/email/:email', authorize,async function(req, res, next) { // PAS UTILISE
    const result =  await userModel.getUserByEmailWithSubs(req.params.email);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* check if the user is admin by email */
router.get('/isAdmin/email/:email', authorize,async function(req, res, next) {// PAS UTILISE
    const result =  await userModel.isAdminByEmail(req.params.email)
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* check if the user is admin by id */
router.get('/isAdmin/:id', authorize,async function(req, res, next) {// PAS UTILISE
    const result =  await userModel.isAdmin(req.params.id)
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* delete a subscription */
router.delete("/delete/subscription/", authorize,async function (req, res) { // utilisé dans another one
    const subscription = await userModel.unfollowUser(req.query.id_user,req.query.id_follower);
    if (!subscription) return res.sendStatus(404);
    res.send(subscription);
  });

/* check if the user is banned by email */
router.get('/isBanned/email/:email', async function(req, res, next) {// PAS UTILISE
    const result =  await userModel.isBannedByEmail(req.params.email)
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* check if the user is banned by id */
router.get('/isBanned/:id', authorize,async function(req, res, next) {// PAS UTILISE
    const result =  await userModel.isBanned(req.params.id)
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* get number of subscribers by user id */
router.get('/subscribers/:id', authorize,async function(req, res, next) {// PAS UTILISE
  const result = await userModel.getSubscribers(req.params.id);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

/* get number of subscriptions by user id */
router.get('/subscriptions/:id', authorize,async function(req, res, next) {// PAS UTILISE
    const result = await userModel.getSubscriptions(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
  });

/* register an user */
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

/* login an user */
router.post('/login', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0) ||
        (req.body.hasOwnProperty("password")&& req.body.password.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.login(req.body);
    if(!connexion) return res.status(404).end();

    return res.json(connexion);
});

/* subscribe to someone */
router.post('/subscribe', authorize,async function(req, res, next) { // utilisé dans another one
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

/* ban someone by email */
router.put('/ban/email/', authorize,async function(req, res, next) {// PAS UTILISE
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.banUserByEmail(req.body.email);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

/* ban someone by id */
router.put('/ban', authorize,async function(req, res, next) { // utilisé panel admin page
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0)
    )
        return res.status(400).end();
    if(!req.user.is_admin) res.sendStatus(409).end();
    const connexion = await userModel.banUser(req.body.id_user);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

/* unban someone by email */
router.put('/unban', authorize,async function(req, res, next) {// utilisé panel admin page
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0)
    )
        return res.status(400).end();
    if(!req.user.is_admin) res.sendStatus(409).end();
    const connexion = await userModel.unbanUser(req.body.id_user);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

/* upgrade someone by email */
router.put('/upAdmin/email', authorize,async function(req, res, next) {// PAS UTILISE
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.upgradeUserByEmail(req.body.email);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

/* upgrade someone by id */
router.put('/upAdmin', authorize, async function(req, res, next) { // utilisé panel admin
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0)
    )
        return res.status(400).end();
        console.log(req.user);
    if (!req.user.is_admin) return res.sendStatus(403); //Forbidden status code
    const connexion = await userModel.upgradeUser(req.body.id_user);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});


/* get users by filter on email or name user */
router.get('/filter/:filter',authorize,async function(req, res, next) { // utilisé userLibrary
    const result =  await userModel.getUsersByFilterOnNameOrEmail(req.params.filter);
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

/* get 2 users at the same time */
router.get('/getTwoUsers/ids/', authorize,async function(req, res, next) {// utilisé ProfilLibrary
    const result =  await userModel.getTwoUsersById(req.query.id1,req.query.id2);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* check if a user is following another one */
router.get('/isFollowing/ids/', authorize,async function(req, res, next) {// utilisé profilLibrary
    const result =  await userModel.isFollowing(req.query.id1,req.query.id2);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

/* user exist by email. */
router.get('/userExist/:email', async function(req, res, next) {
    const result =  await userModel.userExist(req.params.email);
    res.send(result);
    //await userModel.getUserByIdWithSubs(res, req.params.id);
});

/* GET an user by id with all his subscriptions and subscribers */
router.get('/:id', authorize, async function(req, res, next) {// profilLibrary et panelAdmin
    const result =  await userModel.getUserByIdWithSubs(req.params.id);
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

/* password match */
router.post('/matchPass',async function(req, res, next) {// utilisé ProfilLibrary
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0) ||
        (req.body.hasOwnProperty("password")&& req.body.password.length === 0)
    )
        return res.status(400).end();
    const result =  await userModel.passwordMatch(req.body.email,req.body.password);
    res.send(result);
});

module.exports = router;