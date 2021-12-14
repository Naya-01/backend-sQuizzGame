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

// GET /questions/{id} : Get a question from its id
router.get('/:id', authorize,async function(req, res, next) {
  const result = await questionModel.getOne(req.params.id);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

// POST /questions : add a question
router.post("/", authorize,async function (req, res) {
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    !req.body.id_quizz ||
    !req.body.question
  )
    return res.sendStatus(400);

  const question = await questionModel.addOne(req.body);

  res.send(question);
});

// DELETE /questions?quizz=&question= : delete a question
router.delete("/", authorize,async function (req, res) {
  const question = await questionModel.deleteOne(req.query.question);
  // Send an error code '404 Not Found' if the question was not found
  if (!question) return res.sendStatus(404);
  res.send(question);
});

// DELETE /questions/:id
router.delete("/:id", authorize,async function (req, res) {
  await questionModel.deleteAll(req.params.id);

});


module.exports = router;