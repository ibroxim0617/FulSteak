const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")

const User = require("../models/userModel")

const authCtrl = {
    // Register User

    registerUser: async (req, res) => {
        const {username, password} = req.body


        try {
            const oldUser = await User.findOne({username})
            if(oldUser) {
                return res.status(400).json({message: "User already exist!"})
            }

            const heshPassword = await bcrypt.hash(password, 10)

            req.body.password = heshPassword

            const newUser = new User(req.body)
            await newUser.save()
            

            const token = JWT.sign({username, id: newUser._id, role: newUser.role},
            process.env.JWT_SECRET_KEY)

            res.status(201).json({message: "Sign up sucsess", newUser, token})
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },

    // Login user
    loginUser: async (req, res) => {
        const {username, password} = req.body
        try {
            const user = await User.findOne({username})
            if(user) {
                const validaty = await bcrypt.compare(password, user.password)

                if(validaty) {
                    const token = JWT.sign({username, id: user._id, role: user.role},
                    process.env.JWT_SECRET_KEY)
                    return res.status(200).json({message: "Login sucsess!", user, token})
                }
                return res.status(400).json({message: "Wrong password"})
            }
            return res.status(400).json({message: "Wrong password"})
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

}

module.exports = authCtrl