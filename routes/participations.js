var express = require('express');

var router = express.Router();

const db = require('../db');
const {Participations} = require("../model/participations");

const participationModel = new Participations();

// A completer
// /getParticipations?id_try=4&id_participation=4
router.get('/getParticipations', async function(req, res, next) {
    const result = await answerModel.getAllAnswers(req.query.id_try,req.query.id_participation);
    if(!result) res.sendStatus(404).end();

    res.send(result);
});

router.post("/", async function (req, res) {
    // Send an error code '400 Bad request' if the body parameters are not valid
    if (
        !req.body ||
        !req.body.id_quizz ||
        !req.body.id_user ||
        !req.body.score
    )
        return res.sendStatus(400);

    const participation = await participationModel.addOne(req.body);

    res.send(participation);
});

module.exports = router;