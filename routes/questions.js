var express = require('express');
var router = express.Router();
const db = require('../db');
const { Questions } = require("../model/questions");
const { authorize } = require('../utils/authorize');
const questionModel = new Questions();

// GET /questions?quizz= : read all the questions, or by a param that is the id of the quizz we need the questions
router.get('/', authorize,async function(req, res, next) {
  const result = await questionModel.getAll(req.query.quizz);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

// GET /questions/{id} : Get a question by its id
router.get('/:id', authorize,async function(req, res, next) {
  const result = await questionModel.getOne(req.params.id);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

// POST /questions : add a question
router.post("/", authorize,async function (req, res) {
  if (
    !req.body ||
    !req.body.id_quizz ||
    !req.body.question
  )
    return res.sendStatus(400);

  const question = await questionModel.addOne(req.body);

  res.send(question);
});

// DELETE /questions?question= : delete a question
router.delete("/", authorize,async function (req, res) {
  const question = await questionModel.deleteOne(req.query.question);
  if (!question) return res.sendStatus(404);
  res.send(question);
});

// DELETE /questions/:idQuizz
router.delete("/:id", authorize,async function (req, res) {
  //always true. We do no need to know if the id_quizz exists because the deletion will be done in any case
  const bool = await questionModel.deleteAll(req.params.id);
  res.send(bool);
});


module.exports = router;