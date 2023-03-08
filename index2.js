const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

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
}
viewRoles()