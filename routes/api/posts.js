//add post , like , comment

const express = require('express');
const router = express.Router();
const {check,validationResult}=require('express-validator/check')
const auth = require('../../middleware/auth')


const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')


//@route   POST api/posts
//@desc    Create a post
//@access  Private
router.post('/',[auth,[check('text','Text is required').not().isEmpty()]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }


    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({//instantiate new Post from the model
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        })

        const post = await newPost.save()

        res.json(post)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
   
})

//@route   GET api/posts
//@desc    Get all posts
//@access  Private

router.get('/',auth,async(req,res)=>{
    try {
        const posts = await Post.find().sort({date:-1})
        res.json(posts)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
        
    }
})

//@route   GET api/posts/:id
//@desc    Get post by id
//@access  Private

router.get('/:id',auth,async(req,res)=>{//id of post not id of user
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }
        res.json(post)
    } catch (err) {

        console.error(err.message);
        if(err.kind==='ObjectId'){//when id entered by user is not correct
            return res.status(404).json({msg:'Post not found as id incorrect'})
        }
        res.status(500).send('Server Error')
        
    }
})


//@route   DELETE api/posts
//@desc    Delete a post 
//@access  Private

router.delete('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        //if post not exist
        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }

        //check user if he is the owner of the post
        if(post.user.toString()!==req.user.id)//if user of post which is Object id is not equal to logged in user
        {
            return res.status(401).json({msg:'User not authorizeed '})
        }
        await post.remove()
        res.json({msg:'Post removed'})
    } catch (err) {
        console.error(err.message);
        if(err.kind==='ObjectId'){//when id entered by user is not correct
            return res.status(404).json({msg:'Post not found as id incorrect'})
        }
        res.status(500).send('Server Error')
        
    }
})


//@route   PUT api/posts/like/:id
//@desc    Like a post 
//@access  Private

// const words = ['spray', 'limit', 'elite', 'exuberant', 'destruction', 'present'];

// const result = words.filter(word => word.length > 6);

// console.log(result);
// // expected output: Array ["exuberant", "destruction", "present"]

router.put('/like/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        //check if the post has already been liked from the sam user 
        if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){//if amoung many likes which is array if current user who wants to like is equal to the user logged in and its length is greater than 0
            return res.status(400).json({msg:'Post already liked'})
        }
        post.likes.unshift({user:req.user.id})//unshift is used to put in beginning
        await post.save()
        res.json(post.likes);
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }

})


//@route   PUT api/posts/unlike/:id
//@desc    UnLike a post 
//@access  Private



router.put('/unlike/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        //check if the post has already been liked from the sam user 
        if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){//if amoung many likes which is array if current user who wants to like is equal to the user logged in and its length is greater than 0
            return res.status(400).json({msg:'Post has not yet been liked'})
        }
        //get remove index
        const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id)//match the index of logged in user's id with the array of likes 
        post.likes.splice(removeIndex,1)
        await post.save()
        res.json(post.likes);
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }

})

//@route   POST api/posts/comment/:id
//@desc    Comment on  a post 
//@access  Private

router.post('/comment/:id',[auth,[check('text','Text is required').not().isEmpty()]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }


    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)
        const newComment ={//create a object as no need to instantiate as there is no collection in db
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        }
        post.comments.unshift(newComment)
        await post.save()

        res.json(post.comments)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
   
})

//@route   DELETE api/posts/comment/:id/:comment_id
//@desc    Delete Comment on  a post 
//@access  Private
router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        //PUll out comment
        const comment = post.comments.find(comment=>comment.id===req.params.comment_id)

        //Make sure comment exists
        if(!comment){
            return res.status(404).json({msg:'Comment does not exist'})
        }

        //Check user
        if(comment.user.toString()!==req.user.id){
            return res.status(401).json({msg:'User not authorized'})
        }

        //get remove index
        const removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id)//match the index of logged in user's id with the array of likes 
        post.comments.splice(removeIndex,1)
        await post.save()
        res.json(post.comments);


    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})


module.exports = router;
