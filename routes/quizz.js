var express = require('express');
var router = express.Router();
const { Quizz } = require("../model/quizz");
const db = require('../db')

const quizzModel = new Quizz();

// TODO : a tester quand la db sera peuplée
router.get('/mostLiked', async function(req, res, next) {
    const result = await quizzModel.get6MoreLikedQuizz();
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/byEmail/:email', async function(req, res, next) {
    const result = await quizzModel.getQuizzByEmail(req.params.email);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/forUser/:id', async function(req, res, next) {
    const result = await quizzModel.getQuizzByUser(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.get('/:id', async function(req, res, next) {
   const result = await quizzModel.getQuizzById(req.params.id);
   if(!result) res.sendStatus(404).end();
   res.send(result);
});

router.get('/', async function(req, res, next) {
    const result = await quizzModel.getAllQuizz();
    if(!result) res.sendStatus(404).end();
    res.send(result);
})

router.post('/', async function(req, res, next) {
    if (!req.body ||
        (req.body.hasOwnProperty("name") && req.body.name.length === 0) ||
        (req.body.hasOwnProperty("id_creator") && req.body.id_creator.length === 0)
      ) return res.status(400).end();
      const result = await quizzModel.addQuizz(req.body);
      if(!result) res.sendStatus(404).end();
      res.send(result);
})


module.exports = router;
