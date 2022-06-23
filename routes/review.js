const express= require('express')
const reviewrouter= express.Router({mergeParams:true})
const app= express();
const  catchAsync= require('../utils/catchAsync')
const {campgroundSchema,reviewSchema}= require('../validationschema.js')
const Campground= require('../models/campground');
const  expressError= require('../utils/expressError')
const review= require('../models/review')
const path =require('path');
app.set('views',path.join(__dirname,'views'))

const validateReview= (req,res,next)=>{
    console.log(req.body)
    const {error}= reviewSchema.validate(req.body.review)
    
    if(error)
    {
      const msg= error.details.map(el=>el.message).join(', ')
      throw new expressError(`review: ${msg}`,400)
    }
    else
    {
      next()
    }
    }
  //---------------------

  reviewrouter.delete('/:reviewId',async(req,res)=>{
      
    const{id, reviewId}= req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const result=await  review.findByIdAndDelete(reviewId);
   
  res.redirect(`/campgrounds/${id}`)
  
  })
  
//---------------------------------------------------------

reviewrouter.post("",validateReview,catchAsync(async(req,res)=>{
   
const {id} = req.params
const {rating ,body }= req.body.review
if(!body)
return 
const newreview= await new review({body,rating})

let cmpground = await Campground.findById(id)
await cmpground.reviews.push(newreview)
await cmpground.save()
await newreview.save()

res.redirect(`/campgrounds/${id}`)
}))

//-----------------------------------------
module.exports= reviewrouter;