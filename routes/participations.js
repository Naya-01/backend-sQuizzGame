var express = require('express');

var router = express.Router();

const db = require('../db');
const {Participations} = require("../model/participations");

const participationModel = new Participations();
const { authorize } = require('../utils/authorize');

// A completer
// /getParticipations?id_try=4&id_participation=4
router.get('/getParticipations',authorize, async function(req, res, next) {
    const result = await answerModel.getAllAnswers(req.query.id_try,req.query.id_participation);
    if(!result) res.sendStatus(404).end();

    res.send(result);
});

//addOneAnswer

router.post("/answers/",authorize, async function (req, res) {
    // Send an error code '400 Bad request' if the body parameters are not valid
    if (
        !req.body ||
        !req.body.id_participation ||
        !req.body.id_answer
    )
        return res.sendStatus(400);

    const participation = await participationModel.addOneAnswer(req.body);
    if(!participation)res.sendStatus(400)

    res.send(participation);
});

router.post("/",authorize, async function (req, res) {
    // Send an error code '400 Bad request' if the body parameters are not valid
    if (
        !req.body ||
        !req.body.id_quizz ||
        !req.body.id_user ||
        req.body.score === undefined ||
        !req.body.difficulty
    )
        return res.sendStatus(400);

    const participation = await participationModel.addOne(req.body);

    res.send(participation);
});

router.get('/bestScores/:id',authorize, async function(req, res, next) {
    const result = await participationModel.getBestScores(req.params.id);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});
///participations/personnalsBestScores?id_quizz=1&user_email=x@g.com
router.get('/personnalsBestScores/',authorize, async function(req, res, next) {
    const result = await participationModel.getBestPersonalsScores(req.query.id_quizz,req.query.id_user);
    if(!result) res.sendStatus(404).end();
    res.send(result);
});

module.exports = router;