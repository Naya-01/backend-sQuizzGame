//const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const db = require('../db')

const { Questions } = require("../model/questions");
const questionModel = new Questions();

const { Answers } = require("../model/answers");
const answerModel = new Answers();



class Quizz {
    async getQuizzById(id) {
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_quizz = $1', [id]);
        if(!rows) return false;
        return rows[0];
    }

    async getQuizzByUser(id){
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_creator = $1', [id]);
        if(!rows) return false;
        return rows;
    }

    async getAllQuizz(){
        const { rows } = await db.query('SELECT * FROM quizz');
        if(!rows) return false;
        return rows;
    }

    // TODO : a tester quand la db sera peuplée
    async get6MoreLikedQuizz(){
        const { rows } = await db.query('SELECT q.* FROM quizz q WHERE q.id_quizz IN (SELECT l.id_quizz FROM likes l GROUP BY l.id_quizz ORDER BY count(l.id_quizz) LIMIT 6)');
        if(!rows) return false;
        return rows;
    }

    async addQuizz(body){
        let name = escape(body.name);
        const { rows } = await db.query('INSERT INTO quizz (name, id_creator) VALUES ( $1, $2) RETURNING id_quizz', [name, body.id_creator]);
        if(!rows) return false;
        let id_quizz = rows[0].id_quizz; // to get id_quizz
        for(let i =0; i < body.questions.length; i++){
            //Add a question
            let newQuestion = { id_quizz: id_quizz,
                                question: body.questions[i].question,
            }
            let questionAdded = await questionModel.addOne(newQuestion);
            for(let j = 0; j < body.questions[i].answers.length; j++){
                //Add an answer
                let newAnswer = {
                    id_question: questionAdded.id_question,
                    answer: body.questions[i].answers[j].answer,
                    correct: body.questions[i].answers[j].correct
                }
                await answerModel.addOne(newAnswer);
            }
        }
        return rows;
    }
    
}
module.exports = { Quizz };