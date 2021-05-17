const express = require('express');
const { Category } = require('../models/category');
const {Course} = require('../models/course')
const router = express.Router();
const mongoose  = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) =>{
    let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const courseList = await Course.find(filter).populate('category');

    if(!courseList) {
        res.status(500).json({success: false})
    } 
    res.send(courseList);
})

router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id).populate('category');

    if(!course){
        res.status(00).json({success:false});
    }
    res.send(course);
})

router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if(!category)return res.status(400).send("Invalid category");


    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

   let course = new Course({
        name: req.body.name,
        description:req.body.description,
        author:req.body.author,
        image: `${basePath}${fileName}`,
        price:req.body.price,
        category:req.body.category,
        userEnrolled:req.body.userEnrolled,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
    })

    course = await course.save();
    if(!course)
    return res.status(500).send("the course cannot be created");

    return res.send(course);
})

router.put('/:id', uploadOptions.single('image'), async (req, res) =>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid course id');
    }

    const category = await Category.findById(req.body.category);
    if(!category)return res.status(400).send("Invalid category"); 
     
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(400).send('Invalid Course!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = course.image;
    }

    const updatedcourse = await Course.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description:req.body.description,
            author:req.body.author,
            image: imagepath,
            price:req.body.price,
            category:req.body.category,
            userEnrolled:req.body.userEnrolled,
            rating:req.body.rating,
            numReviews:req.body.numReviews,
            isFeatured:req.body.isFeatured
        },
        {new:true}
    )

    if(!updatedcourse)
    return  res.status(500).send('The course cannot be updated');

    res.send(updatedcourse);
})

router.delete('/:courseId', (req, res) =>{
    Course.findByIdAndRemove(req.params.courseId)
    .then(course =>{
        if(course){
            return res.status(200).json({
                success: true,
                message:"the course is deleted"
            })
        }else{
            return res.status(404).json({
                success: false,
                message:"course not found"
            })
        }
    }).catch(err => {
        return res.status(400).json({
            success: false,
            error:err
        })
    })

})

router.get('/get/count', async (req, res) => {
    const courseCount = await Course.countDocuments((count) => count)

    if(!courseCount){
        res.status(00).json({success:false});
    }
    res.send({
        courseCount: courseCount
    });
})

router.get('/get/featured/:count', async (req, res) => {
    const count  = req.params.count ? req.params.count : 0;
    const courseFeatured = await Course.find({isFeatured:true}).limit(+count);

    if(!courseFeatured){
        res.status(00).json({success:false});
    }
    res.send({
        courseFeatured: courseFeatured
    });
})

// router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//         return res.status(400).send('Invalid Course Id');
//     }
//     const files = req.files;
//     let imagesPaths = [];
//     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

//     if (files) {
//         files.map((file) => {
//             imagesPaths.push(`${basePath}${file.filename}`);
//         });
//     }

//     const course = await Course.findByIdAndUpdate(
//         req.params.id,
//         {
//             images: imagesPaths
//         },
//         { new: true }
//     );

//     if (!course) return res.status(500).send('the gallery cannot be updated!');

//     res.send(course);
// });

module.exports = router;