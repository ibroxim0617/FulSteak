const cloundinary = require("cloudinary")
const { default: mongoose } = require("mongoose")
const Post = require("../models/postModel")
const User = require("../models/userModel")
const JWT = require("jsonwebtoken")
const dotenv = require("dotenv")
const fs = require("fs")

dotenv.config() 
 
cloundinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

 
const postCtrl = {
    // Create post
    createPost: async (req, res) => {
        const {token} = req.headers
        const user  = await JWT.verify(token, process.env.JWT_SECRET_KEY)
        const file = req.files.image
       if (token) {
           if (user.role === "admin") {
               const {desc, price, productName, proba,rangi,davlati, } = req.body
                
                try {
                    await cloundinary.v2.uploader.upload(file.tempFilePath, {folder: "internet magazine"}, async(err, result)=>{
                        if(err) {
                            console.log(err);
                        }
                        removeTemp(file.tempFilePath)
                        
                        req.body.image = {public_id: result.public_id, url: result.secure_url}
                        console.log(req.body.image);

                        image = req.body.image
                    })
                    const newProduct = new Post({desc, image, price, productName, proba, davlati, rangi,})

                    newProduct.save()
                    
                    return res.status(201).json({message: "Yangi tovar qo'shildi", newProduct})
                } catch (error) {
                    res.status(400).json({message: "mahsulot haqida tolig malumot bermadingiz"})
                }
            } else{
                res.status(400).json({message: "tovarni faqat admin qoshishi mumkun"})
                removeTemp(file.tempFilePath)
            }
       }else{
           res.status(400).json({message: "tovarni faqat admin qoshishi mumkun"})
           removeTemp(file.tempFilePath)
       }
    },

    // Get post 
    getPost: async (req,res) =>{
        const {id} = req.params
        try {
            const post = await Post.findById(id)
            res.status(200).json(post)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    
    getAllPost: async (req, res) => {
        try {
          const posts = await Post.find({})
          
          res.status(200).json(posts)
        } catch (error) {
          res.status(403).json(error)
        }
    
      },
    // Update Post
    updatePost: async (req, res) => {
        const postId = req.params
        const {adminId} = req.body
        try {
            const post = await Post.findById(postId)
            if(post.adminId === adminId) {
                await post.updateOne({$set: req.body})
                res.status(200).json("Post updated")
            } else {
                res.status(403).json("Authentication failed")
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },

    // Delete post
     
    deletePost: async (req, res) => {
    try {
        const {id} = req.params
        const deletProduct = await Post.findByIdAndDelete(id)
        
        if(deletProduct.image.public_id){
            await cloundinary.v2.uploader.destroy(deletProduct.image.public_id, (err, reslut)=> {
                if(err){
                    console.log(err);
                }else{
                    console.log("rasim ochirildi");
                }
            })
        }

        if(deletProduct){
           return res.status(200).json({message: "Buyum o'chirildi", deletProduct})
        }

        res.status(403).json({message: "Buyum  yo'q!"})
    } catch (error) {
        res.status(500).json(error)
    }
    },
  
    // Like / Dislike posts
    likePost: async (req, res) => {
        const postId = req.params.id
        const {userId} = req.body
        try {
            const post = await Post.findById(postId)
            if(post.likes.includes(userId)) {
                await post.updateOne({$pull: {likes: userId}})
                res.status(200).json("Post disliked")
            } else {
                await post.updateOne({$push: {likes: userId}})
                res.status(200).json("Post liked")
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },

    // Get timeline posts
    getTimelinePosts: async (req, res) => {
        const adminId = req.params.id
        try {
            const currentUserPost = Post.find({adminId})

            const followingPosts = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId),
                    }
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "following",
                        foreignField: "userId",
                        as: "followingPosts"
                    }
                },
                {
                    $project: {
                        followingPosts: 1,
                        _id: 0,
                    }
                }
            ])

            res.status(200).json(currentUserPost.concat(...followingPosts[0].followingPosts).sort((b, a) => {
                return new Date(a.createdAt) - new Date(b.createdAt)
            }))
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

function removeTemp(path){
    fs.unlink(path, (err) => {
        if (err) throw err; 
    })
}

module.exports = postCtrl