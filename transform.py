import json

with open('src/data/questions/II-A.json', 'r') as f:
    data = json.load(f)

new_data = []
id_counter = 20001

for q in data:
    question = q['question']
    options = q['options']
    correct = q['correct_answer']
    
    # Map options to a, b, c, d
    new_options = []
    correct_id = None
    for i, opt in enumerate(options):
        opt_id = chr(ord('a') + i)
        new_options.append({"id": opt_id, "text": opt})
        if opt == correct or (correct.startswith("Option ") and correct[7].lower() == opt_id):
            correct_id = opt_id
    
    new_q = {
        "id": id_counter,
        "question": question,
        "options": new_options,
        "correct_answer": correct_id
    }
    new_data.append(new_q)
    id_counter += 1

with open('src/data/questions/II-A.json', 'w') as f:
    json.dump(new_data, f, indent=4)
