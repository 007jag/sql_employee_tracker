INSERT INTO department (name)
VALUES ('Legal'),
    ('Sales'),
    ('Engineering');
INSERT INTO roles (title, salary, department_id)
VALUES ('Legal Team Lead', 250000, 1),
    ('Lawyer', 170000, 1),
    ('Sales Lead', 100000, 2),
    ('Salesperson', 70000, 2),
    ('Lead Engineer', 150000, 3),
    ('Engineer', 120000, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Mike', 'Jordan', 1, null),
    ('Bob', 'Lazzer', 2, 1),
    ('Jagmit', 'Cheema', 2, 1),
    ('Joe', 'Rogan', 3, null),
    ('Kobe', 'Bryant', 4, 2),
    ('Elon', 'Musk', 4, 2),
    ('Bill', 'Nye', 4, 2),
    ('Chief', 'Keef', 5, null),
    ('Aubrey', 'Drake', 6, 3),
    ('Young', 'Thug', 6, 3);
INSERT INTO manager (first_name, last_name)
SELECT first_name,
    last_name
FROM employee
WHERE manager_confirm = 1;
