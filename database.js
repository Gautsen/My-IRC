const mysql = require('mysql');
function database() {
    let db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'myirc',
    });
    const login = db.query('SELECT * FROM users', function (err, result)
    {
        if (err) throw err;
        console.log(result);
    }
    );
}
database();