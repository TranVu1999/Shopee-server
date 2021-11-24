require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth');
const accountRouter = require('./routes/account');
const shopRouter = require('./routes/shop');
const productCategoryRouter = require('./routes/product_category');
const productRouter = require('./routes/product');
const addressRouter = require('./routes/address');
const administrativeUnitRouter = require('./routes/administrative_unit');
const cartRouter = require('./routes/cart');
const invoiceRouter = require('./routes/invoice');
const productKeywordRouter = require('./routes/product_keyword');

// connect mongodb
const connectDB = async () =>{
    try {
        // await mongoose.connect('mongodb+srv://tranleanhvu1999:tranleanhvu1999@shopee.u4d5e.mongodb.net/shopee?retryWrites=true&w=majority', {
        //     // Các tham số này là mặc định
        //     useCreateIndex: true,
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     useFindAndModify: false
        // })

        await mongoose.connect('mongodb://localhost:27017/shopee_db', {
            // Các tham số này là mặc định
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        console.log("MongoDB Connected")
    } catch (error) {
        console.log("eror", error.message);
        // Restart lại
        process.exit(1);
    }
}
connectDB();

const app = express();
app.use(express.json());
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }

    next();
})

// routes
app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);
app.use('/api/shop', shopRouter);
app.use('/api/product-category', productCategoryRouter);
app.use('/api/product', productRouter);
app.use('/api/address', addressRouter);
app.use('/api/administrative-unit', administrativeUnitRouter);
app.use('/api/cart', cartRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/product-keyword', productKeywordRouter);


const POST = 5000;
app.listen(POST, () => console.log("Server started on port 5000"))

