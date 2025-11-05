const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/questions/XII_Securities Markets Foundation.json', 'utf8'));

let new_data = [];

let id_counter = 20001;

for (let q of data) {

    let question = q.question;

    let options = q.options;

    let correct = q.correct_answer;

    let new_options = [];

    let correct_id = null;

    for (let i = 0; i < options.length; i++) {

        let opt_id = String.fromCharCode(97 + i);

        new_options.push({ id: opt_id, text: options[i] });

        if (options[i] === correct || (correct.startsWith("Option ") && correct[7].toLowerCase() === opt_id)) {

            correct_id = opt_id;

        }

    }

    new_data.push({

        id: id_counter,

        question: question,

        options: new_options,

        correct_answer: correct_id

    });

    id_counter++;

}

fs.writeFileSync('src/data/questions/XII_Securities Markets Foundation.json', JSON.stringify(new_data, null, 4));