const express = require("express")
const fileUpload = require("express-fileupload")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Routes 
const authRoute = require("./src/routes/authRoute")
const userRoute = require("./src/routes/userRoute") 
const postRoute = require("./src/routes/postRoute")
const uploadRoute = require("./src/routes/uploadRoute")

const app = express()

dotenv.config()

const PORT = process.env.PORT || 4000;

// to save files for public 
app.use(express.static('src/public'))


// Middleware
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(fileUpload({useTempFiles: true}))


// usage for routes 
app.use("/auth", authRoute)
app.use("/user", userRoute)
 
 
app.use("/post", postRoute)
app.use("/upload", uploadRoute)


app.get('/', (req, res)=> {
    res.send('Chat app')
})

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> {
    app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`))
}).catch((error) => console.log(error))