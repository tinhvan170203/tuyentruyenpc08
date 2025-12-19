const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
var cookies = require("cookie-parser");
var bodyParser = require('body-parser')

app.use(cookies());


// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
app.use(cors({
    origin: ["http://localhost:5173", "192.168.1.200:4444", "https://thiantoangiaothongpc08hy.vercel.app"],
    credentials: true,
}));
// app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
const port = process.env.port || 4000;


const authRoute = require('./routes/auth.cjs');
const monthiRoute = require('./routes/monthi.cjs');
const donviRoute = require('./routes/donvi.cjs');
const commonRoute = require('./routes/common.cjs');
const cauhoiRoute = require('./routes/cauhoi.cjs');

app.use('/', commonRoute);
app.use('/api/auth', authRoute);
app.use('/api/mon-thi', monthiRoute);
app.use('/api/cau-hoi', cauhoiRoute);
app.use('/api', donviRoute);
const path = require("path");
const basePath = '';

// //cấu hình chạy reactjs trên node server
app.use(basePath + "/", express.static(path.resolve(__dirname + "/dist")));

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname + "/dist/index.html"));
});
app.listen(port, () => {
    console.log('server running ', port)
});

mongoose.set('strictQuery', true);

mongoose.connect("mongodb+srv://vuvantinh121123:AWve4WIzQPadH2Es@hethongtracnghiem.ei1bqlc.mongodb.net/?appName=hethongtracnghiem",{
// mongoose.connect("mongodb://localhost:27017/conganxagioi",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if(err){
        console.log(err)
    }
    console.log('kết nối db thành công')
})
