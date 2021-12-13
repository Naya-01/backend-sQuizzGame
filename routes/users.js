var express = require('express');
var router = express.Router();
const { User } = require("../model/user");
const userModel = new User();
const db = require('../db');
const { authorize } = require('../utils/authorize');


/* GET all users. */
router.get('/', async function(req, res, next) {
    const result =  await userModel.getAllUsers();
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

/* GET users by id. */
router.get('/:id', async function(req, res, next) {
    const result =  await userModel.getUserByIdWithSubs(req.params.id);
    if(!result) res.sendStatus(400).end();
    res.send(result);
   //await userModel.getUserByIdWithSubs(res, req.params.id);
});


/* GET users by email. */
router.get('/email/:email', async function(req, res, next) {
    const result =  await userModel.getUserByEmailWithSubs(req.params.email);
    if(!result) res.sendStatus(400).end();
    res.send(result);
    //await userModel.getUserByIdWithSubs(res, req.params.id);
});

/* user is admin ?. by id*/
router.get('/isAdmin/:id', async function(req, res, next) {
    const result =  await userModel.isAdmin(req.params.id)
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

/* user is admin ?. by email */
router.get('/isAdmin/email/:email', async function(req, res, next) {
    const result =  await userModel.isAdminByEmail(req.params.email)
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

router.delete("/delete/subscription/", async function (req, res) {
    const subscription = await userModel.unfollowUser(req.query.id_user,req.query.id_follower);
    if (!subscription) return res.sendStatus(404);
    res.send(subscription);
  });

/* user is banned ?. by id*/
router.get('/isBanned/:id', async function(req, res, next) {
    const result =  await userModel.isBanned(req.params.id)
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

/* user is banned ?. by email*/
router.get('/isBanned/email/:email', async function(req, res, next) {
    const result =  await userModel.isBannedByEmail(req.params.email)
    if(!result) res.sendStatus(400).end();
    res.send(result);
});

router.get('/subscribers/:id', async function(req, res, next) {
  const result = await userModel.getSubscribers(req.params.id);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

router.get('/subscriptions/:id', async function(req, res, next) {
    const result = await userModel.getSubscriptions(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
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

router.put('/ban', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.banUser(req.body.id_user);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

router.put('/ban/email', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.banUserByEmail(req.body.email);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

router.put('/unban', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.unbanUser(req.body.id_user);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

router.put('/upAdmin', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user.length === 0)
    )
        return res.status(400).end();
    //if (!req.user.is_admin) return res.sendStatus(403); //Forbidden status code
    const connexion = await userModel.upgradeUser(req.body.id_user);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

router.put('/upAdmin/email', async function(req, res, next) {
    if(
        !req.body ||
        (req.body.hasOwnProperty("email") && req.body.email.length === 0)
    )
        return res.status(400).end();

    const connexion = await userModel.upgradeUserByEmail(req.body.email);
    if(!connexion) return res.status(409).end();

    return res.json(connexion);
});

/* GET users by id. */
router.get('/filter/:filter',async function(req, res, next) {
    const result =  await userModel.getUsersByFilterOnNameOrEmail(req.params.filter);
    if(!result) res.sendStatus(400).end();
    res.send(result);
});



router.get('/getTwoUsers/ids/', async function(req, res, next) {
    const result =  await userModel.getTwoUsersById(req.query.id1,req.query.id2);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});


router.get('/isFollowing/ids/', async function(req, res, next) {
    const result =  await userModel.isFollowing(req.query.id1,req.query.id2);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});


module.exports = router;
