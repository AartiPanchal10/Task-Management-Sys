const mongoose = require ("mongoose");
const conn = async () =>{
    try{
        const response = await mongoose.connect("mongodb://localhost:27017/Task-Manage");
        if(response){
            console.log(("conneted to DB"));
        };
    }catch(error){
        console.log(error);
    }
}
conn();