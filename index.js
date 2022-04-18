//define master of variabel
const express = require("express")
const app = express();
const fs = require("fs");
const morgan = require('morgan');

app.set('view engine', 'ejs');

// access all public folder
app.use(express.static(__dirname + '/public')); 

// middleware 
app.use(express.urlencoded({
    extended: false
}));

app.use(express.json());
app.use(morgan('dev'));

const router = require('./routing/router');
var users = require("./data/user.json");

app.use(router);

//rooting
app.get('/', (req, res) => {
    res.render('index'); 
});

//erorr routing 
app.use(function (err, req, res, next) {
    console.error(err)
    res.status(500).json({
        status: 'fail',
        erorr: err.message
    });
});

//api read all data 
app.get('/api/v1/user', (req, res) => {
    res.status(200).json(users)
});

//api get data by id
app.get('/api/v1/user/:id', (req, res) => {
    const user = users.find(i => i.id == req.params.id)
    if (user) {
        res.status(200).json(user)
    } else {
        res.send("Data not found")
    }
});

//api post data
app.post('/api/v1/user/posts', (req, res) => {
    const {
        username,
        password,
        fullname,
        email
    } = req.body
//Get last of ID
    const id = users[users.length - 1].id + 1
    const user = {
        id,
        username,
        fullname,        
        email,
        password        
    }
    users.push(user)
    console.log(users)

// parsing const into json file 
    users = JSON.stringify(users); 
// saving the json file.
    fs.writeFileSync("./data/user.json", users, "utf8");
    res.status(201).json(users)
});

//api put data (rubah atau insert data)
app.put('/api/v1/user/:id', (req, res) => {
    let user = users.filter(i => i.id == req.params.id)

    const params = {
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
        email: req.body.email
    }
    user = {
        ...user,
        ...params
    }

//update 
    users = users.map(i => i.id == user.id ? user : i)
    res.status(200).json(user)
});

//api delete data 
app.delete('/api/v1/post/:id', (req, res) => {
    users = users.filter(i => i.id != req.params.id)
    res.status(200).json({
        message: `Data ID ${req.params.id} berhasil dihapus`
    });
});

//login 
app.post("/login", (req, res) => {
    const {
        email,
        password
    } = req.body
    for (var i = 0; i < users.length; i++) {
        if (email == users[i].email && password == users[i].password) {
            res.redirect(`/games?name=${users[i].username}`) 
            }        
        }              
         res.render('login',{
            status: 'fail',            
        });
});

//sign up
app.post('/sign_up', (req, res) => {
    const {
        username,
        fullname,
        email,
        password
    } = req.body

//get id 
    const id = users[users.length - 1].id + 1
    const sign_up = {
        id,
        username,
        password,
        fullname,
        email
    }
    users.push(sign_up)
    console.log(users)

// parsing into json file 
    users = JSON.stringify(users); 
// saving the json file
    fs.writeFileSync("./data/user.json", users, "utf8"); 
    res.render('login')
});

//erorr handling internal server erorr handler
app.use(function (err, req, res, next) {
    console.error(err)
    res.status(500).json({
        status: 'fail',
        erorr: err.message
    });
});

// 404 handler
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

//create server start 
app.listen(3000, () => {
    console.log('server is running = http://localhost:3000');
});