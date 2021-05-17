const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');


app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

//Routers
const categoriesRoutes = require('./routes/categories');
const courseRoutes = require('./routes/courses');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/courses`, courseRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'CarnaTakeHome'
})
.then(()=>{
    console.log('Database connection is ready');
})
.catch((err) =>{
    console.log(err);
})

//Development
// app.listen(3000, () => {
//     console.log(api);
// })

// production
var server =  app.listen(process.env.PORT || 3000, function(){
    var port = server.address().port;
    console.log(port);
})