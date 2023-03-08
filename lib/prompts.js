const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');
const { dropManager, createManagerTable, addManagers } = require('./reset')
const depArr = []

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

// start prompt for main menu
const promptUser = () => {
    inquirer
    .prompt({
        type: 'list',
        name: 'begin choices',
        message: 'What would you like to do? (Select on of the following)',
        choices: [
        'View All Employees', 
        'View All Employees By Department', 
        'View All Employees By Manager', 
        'Add Employee', 
        'Update Employee Role', 
        'View Departments', 
        'Add Department', 
        'View Roles', 
        'Add Role', 
        'I am finished'
    ]
    })
    // Take the data and use switch statements to decide what to do per option
    .then((data) => {
        switch (data['begin choices']) {
            case 'View All Employees':
                viewAllEmp();
                break;
            case 'View All Employees By Department':
                viewEmpByDep();
                break;
            case 'View All Employees By Manager':
                viewEmpByMngt();
                break;
            case 'Add Employee':
                addEmp();
                break;
            case 'Update Employee Role':
                upEmp();
                break;
            case 'View Departments':
                viewDep();
                break;
            case 'Add Department':
                promptAddDep();
                break;
            case 'View Roles':
                viewRoles();
                break;
            case 'Add Role':
                promptAddRole();
                break;
            case 'I am finished':
                break;
        }
    })
};

//view employees
const viewAllEmp = () => {

        // connect to db
        connection.query(
            // Manipulate tables to view all employees
            `SELECT employee.id, employee.first_name, employee.last_name, roles.title AS role, roles.salary AS salary, manager.first_name AS manager,
            department.name AS department 
            FROM employee
            LEFT JOIN roles
            ON employee.role_id = roles.id
            LEFT JOIN department
            ON roles.department_id = department.id
            LEFT JOIN manager
            ON employee.manager_id = manager.id`,
            // Call back function to decide what to do with data
            function (err, results, fields) {
                if (err) {
                    console.log(err.message);
                    return;
                }
    
                // Show the results as a table to the user
                console.table(results);
    
                // Re-prompt the user
                promptUser();
            }
        );
    };

    // View Employees by Department
const viewEmpByDep = () => {

    // Connect to db
    connection.query(
        // Get the table contents from department table
        `SELECT * FROM department`,

        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }
            // Create empty array for storing info
            depArr = [];
            // for each item in the results array, push the name of the department to the department array
            results.forEach(item => {
                depArr.push(item.name)
            });
            inquirer
                .prompt({
                    type: 'list',
                    name: 'filter-emp-dep',
                    message: 'Choose a department to filter from:',
                    // Choices are from the department array, this will allow for the user to add departments in future
                    choices: depArr
                })
                .then((data) => {
                    // Take the data and filter based on what user chose
                    connection.query(
                        `SELECT employee.id, employee.first_name, employee.last_name, department.name AS department 
                            FROM employee
                            LEFT JOIN roles
                            ON employee.role_id = roles.id
                            LEFT JOIN department
                            ON roles.department_id = department.id
                            WHERE department.name = ?`,
                        // Value user chose that will be replaced with question mark, this prevents SQL Injection attacks
                        [data['filter-emp-dep']],
                        function (err, results, fields) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }

                            // Show results as table
                            console.table(results);
                            // Reprompt user
                            promptUser();
                        }
                    );
                });
        }
    );
};

//  View Employees by Managment
const viewEmpByMngt = () => {
    connection.query(
        `SELECT * FROM manager`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }
            manArr = [];
            results.forEach(item => {
                manArr.push(item.first_name)
            })

            inquirer
                .prompt({
                    type: 'list',
                    name: 'filter-emp-man',
                    message: 'Choose a manager to filter from:',
                    choices: manArr
                })
                .then((data) => {
                    connection.query(
                        `SELECT employee.id, employee.first_name, manager.first_name AS manager
                            FROM employee
                            LEFT JOIN manager
                            ON employee.manager_id = manager.id
                            WHERE manager.first_name = ?`,
                        [data['filter-emp-man']],
                        function (err, results, fields) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }

                            console.table(results);
                            promptUser();
                        }
                    );
                });

        }
    );
};


//add new employee
const addEmp = () => {
    connection.query(
        `SELECT * FROM roles`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }

            let roleArr = [];

            results.forEach(item => {
                roleArr.push(item.title)
            })
            connection.query(
                `SELECT * FROM manager`,
                function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                        return;
                    }

                    let manArr = [];
                    results.forEach(item => {
                        manArr.push(item.first_name)
                    });

                    inquirer
                        .prompt([
                            {
                                type: 'text',
                                name: 'first_name',
                                message: 'What is you employees first name?'
                            },
                            {
                                type: 'text',
                                name: 'last_name',
                                message: 'What is your employees last name?'
                            },
                            {
                                type: 'list',
                                name: 'role_pick',
                                message: 'What will you employees role be?',
                                when: ({ mngt_confirm }) => {
                                    if (!mngt_confirm) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                choices: roleArr
                            },
                            {
                                type: 'confirm',
                                name: 'mngt_confirm',
                                message: 'Is your employees role a manager position?'
                            },
                            {
                                type: 'list',
                                name: 'mngt_pick',
                                message: 'Who will your employees manager be?',
                                choices: manArr
                            }


                        ])
                        .then((data) => {
                            let role_id;
                            for (i = 0; i < roleArr.length; i++) {
                                if (data.role_pick === roleArr[i]) {
                                    role_id = i + 1
                                }
                            }
                            let manager_confirm;
                            if (data.mngt_confirm === true) {
                                manager_confirm = 1;
                            } else {
                                manager_confirm = 0
                            }
                           
                            let manager_id;
                            if (!data.mngt_pick) {
                                manager_id = null;
                            } else {
                                for (i = 0; i < manArr.length; i++) {
                                    if (data.mngt_pick === manArr[i]) {
                                        manager_id = i + 1
                                    }
                                }
                            }
                            
                            connection.query(
                                `INSERT INTO employee (first_name, last_name, role_id, manager_id, manager_confirm)
                                    VALUES (?, ?, ?, ?, ?)`,
                                [data.first_name, data.last_name, role_id, manager_id, manager_confirm],
                                function (err, results, fields) {
                                    if (err) {
                                        console.log(err.message);
                                        return;
                                    }

                                    dropManager();
                                    createManagerTable();
                                    addManagers();
                                    console.log('Employee succesfully added!');
                                    promptUser();
                                }
                                );
                            });
                    }
                );
            }
        );
    };
    
async function viewDep() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`SELECT * FROM department`);
    await connection.end();
    
    console.table(rows);
    promptUser();
 
    };
    

const PromptaddDep = () => {
    inquirer
        .prompt({
            type: 'text',
            name: 'dep_name',
            message: 'Please enter the name of the department you would like to add: '
        })
        .then((data) => {
            
            addDep(data)
        })
};
async function addDep(data) {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`INSERT INTO department (name) VALUES(?)`, [data.dep_name]);
    await connection.end();

    console.log('Added Department!');
    promptUser();
};

// Roles Functionss
async function viewRoles() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`SELECT roles.id, roles.title, roles.salary, department.name
    FROM roles
    LEFT JOIN department
    ON roles.department_id = department.id`);
    await connection.end();
    console.table(rows);
    promptUser();
};       
async function getDepartmentName() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`SELECT * FROM department`);
    await connection.end();

    rows.forEach(item => {
        depArr.push(item.name)
    })
          
    console.table(rows);
    promptUser();
};

async function getDepartmentName() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`SELECT * FROM department`);
    await connection.end();

    rows.forEach(item => {
        depArr.push(item.name)
    })

};

const promptAddRole = () => {
    getDepartmentName();
    inquirer
        .prompt([
            {
                type: 'text',
                name: 'role_title',
                message: 'Please enter the name of the role you would like to add: '
            },
            {
                type: 'number',
                name: 'salary',
                message: 'Please enter the salary of this role. Note: Please do not use commas or periods'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Please select the department you role will be a part of: ',
                choices: depArr
            }
        ])
        .then((data) => {
            addRole(data, depArr)
        })
};

async function addRole(data, depArr) {
    let department_id;

    for (let i = 0; i < depArr.length; i++) {
        if (depArr[i] === data.department) {
            department_id = i + 1;
        };

    }

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`INSERT INTO roles (title, salary, department_id) VALUES(?,?,?)`, [data.role_title, data.salary, department_id]);
    await connection.end();
    console.log('Role added!')
    promptUser();
}

module.exports = { promptUser }