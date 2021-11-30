var express = require('express');
var router = express.Router();
const db = require('../db');
const { Questions } = require("../model/questions");
const questionModel = new Questions();

// GET /questions?quizz= : read all the questions, or by a param that is the id of the quizz we need the questions
router.get('/', async function(req, res, next) {
  const result = await questionModel.getAll(req.query.quizz);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

// GET /questions/{id} : Get a question from its id
router.get('/:id', async function(req, res, next) {
  const result = await questionModel.getOne(req.params.id);
  if(!result) res.sendStatus(404).end();
  res.send(result);
});

// POST /questions : add a question
router.post("/", async function (req, res) {
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
router.delete("/", async function (req, res) {
  const question = await questionModel.deleteOne(req.query.question);
  // Send an error code '404 Not Found' if the question was not found
  if (!question) return res.sendStatus(404);
  res.send(question);
});

// DELETE /questions/:id
router.delete("/:id", async function (req, res) {
  await questionModel.deleteAll(req.params.id);

});


/*
// PUT /questions/{id} : update a question identified by its id
router.put("/:id", async function (req, res) {
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    !req.body.question
  )
    return res.status(400).end();

  const question = await questionModel.updateOne(req.params.id, req.body);
  // Send an error code 'Not Found' if the question was not found :
  if (!question) return res.sendStatus(404);
  res.send(question);
});

*/

module.exports = router;