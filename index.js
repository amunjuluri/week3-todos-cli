const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();
const todoFile = path.join(__dirname, 'todos.json');

function getTodos() {
        return JSON.parse(fs.readFileSync(todoFile));
}

function saveTodos(todos) { //to save the changes, i have used a function where i can call whenever i modify with below commands
    fs.writeFileSync(todoFile, JSON.stringify(todos, null, 2));
}



program
    .command('add-category <name>')
    .description('Add a new category')
    .action((name) => {
        let todos = getTodos();
        if (todos.categories[name]) {
            console.log(`Category "${name}" already exists.`);
            return;
        }
        todos.categories[name] = [];
        saveTodos(todos);
        console.log(`Added category: ${name}`);
    });

program
    .command('add <task>')
    .option('-c <name>', 'Category of the task')
    .description('Add a new task')
    .action((task, options) => {
        let todos = getTodos();
        let category = options.c;
        
        if (!todos.categories[category]) {
            todos.categories[category] = [];
        }
        
        todos.categories[category].push({ task, done: false });
        saveTodos(todos);
        console.log(`Added "${task}" to ${category}`);
    });

program
    .command('list')
    .option('-c <name>')
    .description('List all tasks')
    .action((options) => {
        let todos = getTodos();
        let category = options.c;
        
        if (category) {
            if (!todos.categories[category]) {
                console.log(`Category "${category}" doesn't exist.`);
                return;
            }
            console.log(`Tasks in ${category}:`);
            todos.categories[category].forEach((todo, i) => {
                console.log(`${i + 1}. ${todo.task} [${todo.done ? 'x' : ' '}]`);
            });
        } else {
            for (let category in todos.categories) {
                console.log(`\n${category}:`);
                todos.categories[category].forEach((todo, i) => {
                    console.log(`  ${i + 1}. ${todo.task} [${todo.done ? 'x' : ' '}]`);
                });
            }
        }
    });

program
    .command('done <category> <index>')
    .description('Mark a task as done')
    .action((category, index) => {
        let todos = getTodos();
        if (!todos.categories[category] || !todos.categories[category][index - 1]) {
            console.log(`Task not found in "${category}".`);
            return;
        }
        todos.categories[category][index - 1].done = true;
        saveTodos(todos);
        console.log(`Marked task ${index} in "${category}" as done.`);
    });

program
    .command('remove-category <name>')
    .description('remove a category')
    .action((name) => {
        let todos = getTodos();
        if (!todos.categories[name]) {
            console.log(`Category "${name}" doesn't exist.`);
            return;
        }
        delete todos.categories[name];
        saveTodos(todos);
        console.log(`Bategory removed: ${name}`);
    });

program
    .command('visual')
    .description('visualiation of tasks completion')
    .action(() => {
        let todos = getTodos();
        for (let category in todos.categories) {
            let total = todos.categories[category].length;
            let done = todos.categories[category].filter(t => t.done).length;
            let percent = Math.round((done / total) * 10); // i have used 10 blocks in this case, u can use as many u want
            let bar = '🟩'.repeat(percent) + '🟥'.repeat(10 - percent);
            console.log(`${category.padEnd(15)} |${bar}| ${done}/${total}`);
        }
    });

program.parse(process.argv);