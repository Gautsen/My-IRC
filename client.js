var io = require("socket.io-client");
var readline = require('readline');
var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
var mysql = require('mysql');

let db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myirc',
});

console.log("Welcome to the IRC client");
//On demande le pseudo
rl.question("Login: ", function (username) {
    if (username == "") {
        console.log("Tu dois entrer un pseudo");
        process.exit();
    }
    //On demande le login 
    let login = db.query('SELECT * FROM users WHERE login = ?', [username], function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            console.log("Le pseudo n'existe pas, merci de vous inscrire");
            console.log("Merci de renseigner votre login et votre mot de passe pour l'inscription");
            rl.question("Login: ", function (login) {
                rl.question("Password: ", function (password) {
                    let register = db.query('INSERT INTO users (login, password, is_connected, is_admin) VALUES (?, ?, 0, 0)', [login, password], function (err, result) {
                        if (err) throw err;
                        console.log("Vous êtes inscrit");
                        process.exit();
                    });
                });
            });
        }
        //On demande le mot de passe
        rl.question("Password: ", function (password) {
            if (password == "") {
                console.log("Tu dois entrer un mot de passe");
                process.exit();
            }

            //check si le mot de passe est correct
            let pwd = db.query('SELECT * FROM users WHERE password = ?', [password], function (err, result) {
                if (err) throw err;
                if (result.length == 0) {
                    console.log("Le mot de passe est incorrect");
                    process.exit();
                }
                // actualise statut de connexion
                else { let isco = db.query('UPDATE users SET is_connected = 1 WHERE is_connected = 0') };

                //Connexion admin
                if (username == "admin") {
                    console.log("Vous êtes connecté en tant qu'administrateur");
                    console.log("Bienvenue dans le salon admin");
                }
                //Connexion user
                else {
                    console.log("Vous êtes connecté en tant qu'utilisateur");
                }

                //Si login et mot de passe OK : On se connecte au serveur
                var socket = io.connect("http://localhost:3000");

                var sendMsg = function () {
                    rl.question('- ', function (reply) {
                        console.log("".concat(username, " : ").concat(reply));
                        socket.emit('simple chat message', "".concat(username, " : ").concat(reply));
                        sendMsg();
                        //Si on tape /quit on quitte le salon
                        if (reply == "--quit") {
                            let isco = db.query('UPDATE users SET is_connected = 0 WHERE is_connected = 1');
                            console.log("Vous allez quitter le salon");
                            process.exit();
                        }
                        //Liste des utilisateurs connectés
                        if (reply == "--list") {
                            let list = db.query('SELECT login FROM users WHERE is_connected = 1', function (err, result) {
                                if (err) throw err;
                                console.log("Liste des utilisateurs connectés: ");
                                console.log("==================");
                                for (let i = 0; i < result.length; i++) {
                                    console.log(result[i].login);
                                }
                                console.log("==================");
                            });
                        }
                        if (reply == "--join"){
                            console.log("Vous allez rejoindre le salon général");
                            socket.emit('simple chat message', "".concat(username, " a rejoint le salon général"));
                        }
                    });
                };
                socket.on('connect', function () {
                    console.log('Connexion établie avec le serveur général');
                    console.log(`Liste des commandes: `
                        + `\n--quit : Quitter le salon`
                        + `\n--list : Afficher la liste des utilisateurs connectés`
                        + `\n--join : Rejoindre le salon général`
                        + `\n--nick : Changer de pseudo`);
                    sendMsg();
                });
                socket.on('simple chat message', function (message) {
                    console.log(message);
                });
                socket.on('disconnect', function () {
                    console.log('Connexion perdue avec le serveur');
                });
            });
        });
    });
});
