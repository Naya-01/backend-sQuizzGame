var express = require('express');

var router = express.Router();

const db = require('../db');
const { authorize } = require('../utils/authorize');

const { Answers } = require("../model/answers");

const answerModel = new Answers();

// Add an answer about a question.
router.post("/",authorize,async function (req, res) {

    // Send an error code '400 Bad request' if the body parameters are not valid

    if (
        !req.body ||
        !req.body.id_question ||
        !req.body.answer ||
        !req.body.correct
    )
        return res.sendStatus(400);

    const answer = await answerModel.addOne(req.body);

    res.send(answer);
});

router.get('/allAnswers/:id',authorize, async function(req, res, next) {
    const result = await answerModel.getAllAnswers(req.params.id);
    if(!result) res.sendStatus(404).end();

    res.send(result);
});

router.get('/oneAnswers/:id',authorize, async function(req, res, next) {
    const result = await answerModel.getOne(req.params.id);
    if(!result) res.sendStatus(404).end();

    res.send(result);
});

router.delete("/:id",authorize, async function (req, res) {
    const answer = await answerModel.deleteOne(req.params.id);

    // Send an error code '404 Not Found' if the question was not found
    if (!answer) return res.sendStatus(404);

    res.send(answer);
});

module.exports = router;