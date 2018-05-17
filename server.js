const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT | 3128;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const isEmpty = require('is-empty');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const jwt = require("jsonwebtoken");
const cors = require("cors");
let nodemailer = require("nodemailer");
const app = express();


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'simonhuspsn@gmail.com',
        pass: 'Soccer900psn'
    }
});

app.set('appSecret', 'secretforinvoicingapp');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.get('/', function(req,res) {
    res.send("Welcome to invoicing app");
});

app.post('/register', function(req, res) {
    console.log(req.body);
    console.log('this is req body name ' + req.name);
    if( isEmpty(req.body.name) || isEmpty(req.body.email) || isEmpty(req.body.company_name) || isEmpty(req.body.password)) {
        return res.json({
            'status': false,
            'message': 'All fields are required'
        });
    }

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        let db = new sqlite3.Database("./database/InvoicingApp.db");
        let sql = `INSERT INTO users(name, email, company_name, password) VALUES('${
            req.body.name
        }','${req.body.email}','${req.body.company_name}', '${hash}')`;
        db.run(sql, function(err) {
            if (err) {
                throw err;
            } else {
                let user_id = this.lastID;
                console.log(user_id + ' this is user id');
                let query = `SELECT * from users WHERE id ='${user_id}'`;
                db.all(query, [], (err, rows) => {
                    console.log('querying');
                    if (err) {
                        console.log(err + ' sql error');
                        throw err;
                    }
                    console.log(rows + ' this is rows');
                    let user = rows[0];
                    const payload = {
                        user: user
                    }

                    let token = jwt.sign(payload, app, app.get("appSecret"), {
                        expiresInMinutes: "24h"
                    });

                return res.json({
                    status: true,
                    message: "User Created",
                    token: token,
                    user: user
                });
            });
            }
        });
   db.close();
});
});

app.post('/login', multipartMiddleware, function(req, res) {
    //console.log(req + ' this is req');
    let db = new sqlite3.Database("./database/InvoicingApp.db");
    let sql = `SELECT * from users where email='${req.body.email}'`;
    //console.log(req.body.email + ' this is req email');
    db.all(sql, [], (err, rows) => {
        if(err) {
            console.log(err + ' this is sql error');
            throw err;
        }
    
    db.close();
    if (rows.length == 0) {
        return res.json({
            status: false,
            message: "Sorry, wrong email"
        });
    }
    let user = rows[0];
    let authenticated = bcrypt.compareSync(req.body.password, user.password);
    delete user.password;
    if (authenticated) {
        const payload = {user: user};
        let token = jwt.sign(payload, app.get("appSecret"), {
            expiresIn: "24h"
        });

        return res.json({
            status: true,
            user: user,
            token: token
        });
    }
    return res.json({
        status: false,
        message: "wrong password, please retry"
    });
    });
});

app.post('/invoice', multipartMiddleware, function(req, res) {
    let txn_names = req.body.txn_names.split(",");
    let txn_prices = req.body.txn_prices.split(",");
    if (isEmpty(req.body.name)) {
        return res.json({
            status: false,
            message: "Invoice needs a name"
        });
    }

    let db = new sqlite3.Database('./database/InvoicingApp.db');
    let sql = `INSERT INTO invoices(name, user_id,paid) VALUES (
        '${req.body.name}',
        '${req.body.user_id}',
        0
    )`;
    db.serialize(function() {
        db.run(sql, function(err) {
            if (err) {
                throw err;
            }
            let invoice_id = this.lastID;
            console.log(req.body);
            for (let i = 0; i < txn_names.length; i++) {
                console.log(req.body.txn_names);
                let query = `INSERT INTO transactions(name, price, invoice_id) VALUES(
                    '${txn_names[i]}',
                    '${txn_prices[i]}',
                    '${invoice_id}'
                )`
                db.run(query);
            }
            return res.json({
                status: true,
                message: "invoice created"
            });
        });
    });



});

app.use(function(req, res, next){

    let token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (token) {
        jwt.verify(token, app.get("appSecret"), function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: "failed to authenticate token"
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: "No token provided"
        })
    }
});



app.get('/invoice/user/:user_id', multipartMiddleware, function(req, res) {
    let db = new sqlite3.Database('./database/InvoicingApp.db');
    let sql = `SELECT * FROM invoices LEFT JOIN transactions ON invoices.id=transactions.invoice_id WHERE user_id='${req.params.user_id}' `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
            console.log('sql error has occured');
        } else {



        return res.json({
            status: true,
            transactions: rows
        });
        console.log('no error');
    }
    });
});

app.get('/invoice/user/:user_id/:invoice_id', multipartMiddleware, function (req, res) {
    let db = new sqlite3.Database('./database/InvoicingApp.db');
    let sql = `SELECT * FROM invoices LEFT JOIN transactions ON invoices.id=transactions.invoice_id WHERE user_id='${req.params.user_id}' AND invoice_id='${req.params.invoice_id}' `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }

        return res.json({
            status: true,
            transactions: rows
        });
    });
});

app.post('/sendmail', multipartMiddleware, function(req,res){
    let sender = JSON.parse(req.body.user);
    let recepient = JSON.parse(req.body.recepient);
    let amount = JSON.parse(req.body.amount);
    let mailOptions = {
        from: "simonhuspsn@gmail.com",
        to: recepient.email,
        subject: `Hi, ${recepient.name}. Here is a Invoice from ${sender.company_name}. The amount owing is ${amount}`,
        text: `You owe ${sender.company_name}`
    };
    console.log(sender);
    console.log(recepient);
    console.log(amount);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.json ({
                status: 200,
                message: `Error sending to ${recepient.name}`
            });   
        } else {
            return res.json ({
                status: 200,
                message: `Email sent to ${recepient.name}`
            });
        }
    });
}); 


app.listen(PORT, function() {
    console.log(`App running on localhost:${PORT}`);
})

