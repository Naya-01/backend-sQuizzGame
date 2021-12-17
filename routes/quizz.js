var express = require('express');
var router = express.Router();
const { Quizz } = require("../model/quizz");
const db = require('../db')
const { authorize } = require('../utils/authorize');

const quizzModel = new Quizz();

router.get('/isLiked/', authorize, async function(req, res, next) {
    const result = await quizzModel.isLike(req.query.id_quizz,req.query.id_user);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

// TODO : a tester quand la db sera peuplée
router.get('/mostLiked', authorize, async function(req, res, next) {
    const result = await quizzModel.get6MoreLikedQuizz();
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/recherche/:critere', authorize, async function(req, res, next) {
    const result = await quizzModel.getQuizzByCritere(req.params.critere);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/explorer', authorize, async function(req, res, next) {
    const result = await quizzModel.getQuizzExplorer();
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/byEmail/:email', authorize, async function(req, res, next) {
    const result = await quizzModel.getQuizzByEmail(req.params.email);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/abonnements/:id', authorize, async function(req, res, next) {
    const result = await quizzModel.getQuizzAbonnements(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/likes/:id', authorize, async function(req, res, next) {
    const result = await quizzModel.getNbLikes(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/forUser/:id', authorize, async function(req, res, next) {
    const result = await quizzModel.getQuizzByUser(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/:id', authorize, async function(req, res, next) {
   const result = await quizzModel.getQuizzById(req.params.id);
   if(!result) res.sendStatus(404).end();
   res.send(result);
});


router.post('/', authorize, async function(req, res, next) {
    if (!req.body ||
        (req.body.hasOwnProperty("name") && req.body.name.length === 0) ||
        (req.body.hasOwnProperty("id_creator") && req.body.id_creator.length === 0)
      ) return res.status(400).end();
      const result = await quizzModel.addQuizz(req.body);
      if(!result) res.sendStatus(404).end();
      res.send(result);
})



router.delete("/unlike/", authorize, async function (req, res) {
    // Send an error code '400 Bad request' if the body parameters are not valid
    if (
        !req.body ||
        !req.body.id_quizz ||
        !req.body.id_user
    )
        return res.sendStatus(400);

    const like = await quizzModel.unlike(req.body);
    if(!like)res.sendStatus(400)

    res.send(like);
});

router.delete('/:id', authorize, async function(req, res, next) {
      const result = await quizzModel.deleteQuizz(req.params.id);
      if(!result) res.sendStatus(404).end();
      res.send(result);
})

router.post("/likes/", authorize, async function (req, res) {
    // Send an error code '400 Bad request' if the body parameters are not valid
    if (
        !req.body ||
        !req.body.id_quizz ||
        !req.body.id_user
    )
        return res.sendStatus(400);

    const like = await quizzModel.like(req.body);
    if(!like)res.sendStatus(400)

    res.send(like);
});

module.exports = router;
