const express = require('express');
const connectDB = require('./config/db');
const app = express();
// connect DB
connectDB();
app.get('/',(req,res)=>res.send("API RUNNING"));
app.use(express.json({extended:false}));
const PORT = process.env.PORT || 5000;
//define routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/posts',require('./routes/api/posts'));
app.use('/api/profile',require('./routes/api/profile'));

app.listen(PORT,()=>{
    console.log(`server running @ ${PORT}`);
});