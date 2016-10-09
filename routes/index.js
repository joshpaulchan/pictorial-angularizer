var router = require('express').Router();

// require multer
var multer = require('multer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// create multer object
var upload = multer({ dest: 'public/uploads/' });

// POST to `/uploadFile`
// 
// Upload a file to this url
// 
// @note: upload.single(...) takes the name of the field you called the file on
// the client (in this example, you can see it's called 'fileName')
// @note: Doesn't matter if you used React or HTML forms to send the request
// @note: the`multer` package saves the file to the filesystem for you already,
// using `upload.single`
router.post('/uploadFile', upload.single('seed'), function(req, res, next) {
  // Receive file that was uploaded
  
  // Here, if you choose, you can send file to S3/filesystem/wherever
  console.log("Files that were uploaded: ", req.file);
  
  // Path of the file that was sent to server
  console.log("Url of the new file: ", req.file.path);
  
  res.status(200).json({
    success: true,
    message: '/uploads/' + req.file.filename
  });
  
});

module.exports = router;
