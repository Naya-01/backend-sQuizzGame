var escape = require("escape-html");
const db = require('../db');

class Questions {
    constructor() {
    }

    /**
     * Returns all resources
     * @param {id_quizz} id of the quizz we need its questions
     * @returns {Array} Array of resources
     */
    async getAll(id_quizz) {
        if(id_quizz==undefined){
            const { rows } = await db.query('SELECT * FROM questions');
            if(!rows) return;
            return rows;
        }
        else{
            const { rows } = await db.query('SELECT * FROM questions WHERE id_quizz=$1',[id_quizz]);
            return rows;
        }
        
    }

    /**
     * Returns the resource identified by id
     * @param {number} id - id of the resource to find
     * @returns {object} the resource found or undefined if the id does not lead to a resource
     */
    async getOne(id) {
        const { rows } = await db.query('SELECT * FROM questions WHERE id_question = $1', [id]);
        if(!rows) return;
        return rows[0];
    }

    /**
     * Add a resource in the DB and returns the added resource (containing a new id)
     * @param {object} body - it contains all required data to create a ressource
     * @returns {object} the resource that was created (with id)
     */

    async addOne(body) {
       //insertion
       const req = 'INSERT INTO questions (id_quizz, question) VALUES ($1, $2);';
       const data = [body.id_quizz, escape(body.question)];
       await db.query(req,data);
       //get the tuple of the question inserted and make a new objet to return
       let { rows } =  await db.query('SELECT max(id_question) FROM questions WHERE id_quizz=$1',[body.id_quizz]);
       const newQuestion={
           id_question: rows[0].max,
           id_quizz: body.id_quizz,
           question: body.question,
       };
       return newQuestion;
    }

    /**
     * Delete a resource in the DB and return the deleted resource
     * @param {number} id - id of the resource to be deleted
     * @returns {object} the resource that was deleted or undefined if the delete operation failed
     */
    async deleteOne(id_quizz,id_question) {
        let question = await this.getOne(id_question);
        if(!question) return false;
        let req = 'DELETE FROM questions WHERE id_quizz=$1 AND id_question=$2;';
        let data = [id_quizz, id_question];
        await db.query(req,data);
        return question;
    }

    /**
     * Update a resource in the DB and return the updated resource
     * @param {number} id - id of the resource to be updated
     * @param {object} body - it contains all the data to be updated
     * @returns {object} the updated resource or undefined if the update operation failed
     */
    updateOne(id, body) {
        /* TO MODIDY--------------------------
        const collection = parse(this.jsonDbPath, this.collection);
        const foundIndex = collection.findIndex((item) => item.id == id);
        if (foundIndex < 0) return;
        // Escape all dangerous potential new chars
        const updatedResource = { ...collection[foundIndex] };
        for (const key in body) {
            if (Object.hasOwnProperty.call(body, key)) {
                const element = body[key];
                updatedResource[key] = escape(element);
            }
        }
        // replace the resource found at index : (or use splice)
        collection[foundIndex] = updatedResource;

        serialize(this.jsonDbPath, collection);
        return updatedResource;
        */
    }

}
module.exports = { Questions };