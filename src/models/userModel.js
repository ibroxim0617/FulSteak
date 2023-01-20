const mongoose = require("mongoose")

const userScheme = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    
    lastname: {
        type: String,
        required: true,
    },
    
    role: {
        type: String,
        default: "user"
    },
   
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("User", userScheme)