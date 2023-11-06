const express = require('express');
const router =express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Note = require("../../models/Notification");


//@route POST api/posts
//@desc Create posts
//@access Private
router.get('/all', (req, res) => {
    Note.find()
.then(data => {
    res.status(200).json(data)
}).catch(err => {
  return res.status(400).json(err);
    
})


})

router.get('/setFlag', (req, res) => {
    const param = req.query.param
    const userNum = {};
    
    Note.findOneAndUpdate(
        { _id: param},
        { $set: {status: true}},
        { new: true }
      )
        .then((data) => res.json(data))
        .catch((err) => console.log(err));


})


//@route POST api/posts/unlike/:id
//@desc Unlike post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {     
      Post.findById(req.params.id)
        .then(post => {
          
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this post' });
          }
          console.log(req.user.id)
          //Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
            
            //Splice out of array
            post.likes.splice(removeIndex, 1);

            //Save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnofound: 'No post found' }))
    })
})




module.exports = router;