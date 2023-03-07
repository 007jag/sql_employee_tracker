const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

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
        choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager', 'Add Employee', 'Update Employee', 'View Departments', 'Add Department', 'View Roles', 'Add Role']
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
            case 'Update Employee':
                upEmp();
                break;
            case 'View Departments':
                viewDep();
                break;
            case 'Add Department':
                addDep();
                break;
            case 'View Roles':
                viewRoles();
                break;
            case 'Add Role':
                addRole();
                break;
        }
    })
};

