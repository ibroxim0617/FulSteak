const mongoose = require("mongoose")

const postScheme = new mongoose.Schema({
    desc: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    productName:{
        type: String,
        required: true,
    },
    likes: [],

    image: {
        type: Object,
        required: true
    },
    proba: {
        type: Object,
        required: true,
    },
    davlati: {
        type: Object,
        required: true,
    },
    rangi: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Post", postScheme)