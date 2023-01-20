const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")

const User = require("../models/userModel")

const userCtrl = {
    // Get a user
    getUser: async (req, res) => {
        const {id} = req.params
       try {
        const user = await User.findById(id)
        if(user) {
            const {password, ...otherDetails} = user._doc

            return res.status(200).json(otherDetails)
        }
        res.status(404).json("No such user")
       } catch (error) {
        res.status(500).json({message: error.message})            
       }
    },

     

    // Update user
    updateUser: async (req, res) => {
        const {id} = req.params
        const {userId, password} = req.body
        try {
            if(id === userId) {
                if(password) {
                    const heshPassword = await bcrypt.hash(password, 10)
                    req.body.password = heshPassword
                }

                const user = await User.findByIdAndUpdate(id, req.body, {new: true})

                const token = JWT.sign({username, id: newUser._id},process.env.JWT_SECRET_KEY, {expiresIn: "2h"})
                
                res.status(200).json({user, token})
            }else {
                res.status(403).json("Acces Deined! You can update only your own Account.")
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        const {id} = req.params
        const {userId} = req.body

        if(id === userId) {
            try {
                await User.findByIdAndDelete(id ) //email
                res.status(200).json("User deleted")
            } catch (error) {
                res.status(403).json("Acces Deined! You can update only your own Account.")
            }
        }
    },

    // Follow user
    followUser: async (req, res) => {
        const {id} = req.params

        const {userId} = req.body

        if(id === userId) {
            res.status(403).json("Action forbiden")
        } else {
            try {
                const followUser = await User.findById(id)
                const followingUser = await User.findById(userId)

                if(!followUser.followers.includes(userId)) {
                    await followUser.updateOne({$push: {followers: userId}})

                    await followingUser.updateOne({$push: {following: id}})
                    
                    res.status(200).json("User Followd!")
                } else {
                    res.status(403).json("You can following this user")
                }
            } catch (error) {
                res.status(500).json({message: error.message}) 
            }
        }
    }, 

    // Unfollow user
    unfollowUser: async (req, res) => {
        const {id} = req.params
        
        const {userId} = req.body

        if(id === userId) {
            res.status(403).json("Action forbiden")
        } else {
            try {
                const unfollowUser = await User.findById(id)
                const unfollowingUser = await User.findById(userId)

                if(!unfollowUser.followers.includes(userId)) {
                    await unfollowUser.updateOne({$pull: {followers: userId}})

                    await unfollowingUser.updateOne({$pull: {following: id}})
                    
                    res.status(200).json("User Followd!")
                } else {
                    res.status(403).json("You are not folling this user")
                }
            } catch (error) {
                res.status(500).json({message: error.message}) 
            }
        }
    }
}

module.exports = userCtrl