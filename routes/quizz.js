var express = require('express');
var router = express.Router();
const { Quizz } = require("../model/quizz");
const db = require('../db')

const quizzModel = new Quizz();



router.get('/:id', (req, res, next) => {
    quizzModel.getQuizzById(req.params.id, res);
  })

router.get('/', (req, res, next) => {
    quizzModel.getAllQuizz(res);
})

// TODO : a tester quand la db sera peuplée
router.get('/mostLiked', (req, res, next) => {
    quizzModel.get5MoreLikedQuizz(res);
})

module.exports = router;
