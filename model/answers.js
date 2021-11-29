var escape = require("escape-html");
const db = require('../db');

class Answers {

    constructor() {

    }

    /**
     * Returns all answers without params
     * Returns all answers of a specific question
     * @returns {Array} Array of answers
     * @param id_question searched
     */
    async getAllAnswers(id_question) {
        if(id_question===undefined){
            return false;
        }
        else{
            const { rows } = await db.query('SELECT * FROM answers WHERE id_question=$1',[id_question]);
            return rows;
        }
    }

    /**
     * Returns null without answers
     * Returns the answers of a specific question and participation
     * @param {id_question} id of the question
     * @returns {Array} Array of answers
     */
    async getAllParticipations(id_participation) {
        if(id_participation===undefined){
            return false;
        }
        else{
            const { rows } = await db.query('SELECT a.* FROM answers a,participations_answers pa WHERE pa.id_participation=$2 AND a.id_answer = pa.id_answer',[id_participation]);
            return rows;
        }
    }

    /**
     * Add an answer in the answers table and returns the added answer
     * @param {object} body - it contains all required data to create the answer
     * @returns {object} the answer that was created (with id)
     */
    async addOne(body) {
        const req = 'INSERT INTO answers (id_question, answer, correct) VALUES ($1, $2 ,$3) RETURNING id_answer as id;';

        const data = [body.id_question, escape(body.answer),body.correct];

        let {rows} = await db.query(req,data);

        console.log(rows[0]);

        const newAnswer={
            id_answer: rows[0].id,
            id_question: body.id_question,
            answer: body.answer,
            correct: body.correct
        };

        return newAnswer;
    }

    /**
     * Returns the resource identified by id
     * @param {number} id - id of the resource to find
     * @returns {object} the resource found or undefined if the id does not lead to a resource
     */
    async getOne(id) {
        const { rows } = await db.query('SELECT * FROM answers WHERE id_answer = $1', [id]);
        if(!rows) return false;
        return rows[0];
    }

    /**
     * Delete a resource in the DB and return the deleted resource
     * @param {number} id - id of the resource to be deleted
     * @returns {object} the resource that was deleted or undefined if the delete operation failed
     */
    async deleteOne(id_answer) {
        // Verify if the answer exist
        let answer = await this.getOne(id_answer);
        if(!answer) return false;

        // Delete all the participations of an answers
        let req = 'DELETE FROM participation_answers WHERE id_answer=$1;';
        let data = [id_answer];
        await db.query(req,data);

        // Delete the answers
        req = 'DELETE FROM answers WHERE id_answer=$1;';
        await db.query(req,data);

        // Return the deleted answer
        return answer;
    }

}
module.exports = { Answers };