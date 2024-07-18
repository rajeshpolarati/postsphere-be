const express = require('express');
require('dotenv').config();
const models = require('./models');
const apiRoute = require('./routes/index')
const bodyParser = require('body-parser');
const {initializeSocket} = require('./socket')
const ws = require('socket.io');
const http = require('http');
const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);
const cors = require('cors');
app.use(cors());
const io = initializeSocket(server);
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next();
})
app.use("/api/v1", apiRoute)

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})