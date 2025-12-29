const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const cookies = require("cookie-parser");
const bodyParser = require('body-parser');
const path = require("path");

app.use(cookies());

// 1. Cấu hình CORS
app.use(cors({
    origin: ["http://localhost:5173", "https://thiantoangiaothongpc08hy.vercel.app", "http://localhost:4000","http://192.168.10.234:5173"],
    credentials: true,
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));

// 2. Tối ưu kết nối MongoDB cho Serverless (Vercel)
const MONGODB_URI = "mongodb+srv://vuvantinh121123:AWve4WIzQPadH2Es@hethongtracnghiem.ei1bqlc.mongodb.net/?appName=hethongtracnghiem";

// Biến global để lưu trữ trạng thái kết nối
let cachedConnection = global.mongoose;

if (!cachedConnection) {
    cachedConnection = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cachedConnection.conn) {
        return cachedConnection.conn;
    }

    if (!cachedConnection.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false, // Tắt buffer để tránh treo request khi chưa kết nối xong
        };

        mongoose.set('strictQuery', true);
        cachedConnection.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('Kết nối MongoDB thành công');
            return mongoose;
        });
    }
    
    try {
        cachedConnection.conn = await cachedConnection.promise;
    } catch (e) {
        cachedConnection.promise = null;
        console.error('Lỗi kết nối MongoDB:', e);
        throw e;
    }

    return cachedConnection.conn;
}

// 3. Middleware để đảm bảo DB luôn sẵn sàng trước khi xử lý request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Lỗi kết nối cơ sở dữ liệu" });
    }
});

// 4. Routes
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

// 5. Cấu hình Static Files
app.use("/", express.static(path.resolve(__dirname + "/dist")));

app.get("*", (request, response) => {
    response.sendFile(path.resolve(__dirname + "/dist/index.html"));
});

// 6. Lắng nghe Port (Chỉ dùng khi chạy local, Vercel sẽ tự handle)
const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log('Server chạy tại port: ', port);
    });
}

module.exports = app; // Quan trọng để Vercel nhận diện app
