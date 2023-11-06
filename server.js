const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const Note = require("./models/Notification");


const passport = require('passport');
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const Notification = require('./routes/api/Notification');

const fs = require('fs');
// const sharp = require('sharp');
const multer = require('multer');
const bodyParser = require("body-parser");

const nodemailer = require('nodemailer');
////
const http = require('http');
const socketIO = require('socket.io');//
const { PDFDocument } = require('pdf-lib');
const app = express();
app.use(morgan('dev'))
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {

    // console.log('req2222', req.body.filename)
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // // const uniqueSuffix = Date.now();
    // const filename = req.body.filename;

    // const fileName = req.body.filename[0] + '.' + file.originalname.split('.').pop();

    // const fileName = req.body.filename[0] + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();

    // cb(null, fileName);
    cb(null, file.originalname);

  },
});
const upload = multer({ storage });
// const transporter = nodemailer.createTransport({
//   service: 'hotmail',
//   auth: {
//     user: 'sujunkai777@hotmail.com',
//     pass: 'rkdgowlwk!',
//   },
// });

// var transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "e3e6fe633c9582",
//     pass: "6f693feb20deba"
//   }
// });

// const mailOptions = {
//   from: 'wasi949916@hotmail.com',
//   to: 'medusa123123000@hotmail.com',
//   subject: 'Hello from Node.js',
//   text: 'This is the plain text version of the email.',
//   html: '<p>This is the HTML version of the email.</p>',
// };

const server = http.createServer(app);
var chatServer = require('http').Server(app);

// const io = socketIO(server);

// Create a Socket.IO server instance

// Socket.IO event: client connected
const io = require('socket.io')(chatServer, {
  cors: {
  }
});
var ns = io.of("/");
io.on('connection', (socket) => {
  console.log('aaaaa', process.env.NODE_ENV)

  // transport.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.error('Error sending email:', error);
  //   } else {
  //     console.log('Email sent:', info.response);
  //   }
  // });

  console.log('A client connected', ns.connected);

  // Socket.IO event: client disconnected
  socket.on('disconnect', () => {
    console.log('A client disconnected');

  });
  socket.on('Add User', (ary) => {
    // Note
    console.log('ary,', ary)
    console.log('Add User', ary)
    let notification = new Note ({
      user_id: ary.userid,
      agency_id:ary.client,
      msg_content: ary.user
    })
    notification
    .save()
    .then((data) => {
      console.log('daaa', data);
    socket.broadcast.emit('registerNewUsertoClient', data)
      
    })
    .catch((err) => {
      console.log(err)});
    var flag = false
    console.log(ns.connected)

    //   if (ns) {
    //     Object.keys(ns.connected).forEach(function (id) {

    //       if(ns.connected[id].userID == userID){
    //         flag = true;
    //       }    
    //     });
    // }
    // if(!flag) {
    //   socket.userID = userID;
    // }

  })
});

app.post('/upload', upload.array('files'), (req, res) => {
  // Access the uploaded files via req.files
  console.log('files', req.body);
  res.status(200).json('success')
  // Handle file upload logic here

  // res.send('Files uploaded successfully');
});

function isFilenameWithinDateRange(fileName, startDate, endDate) {
  const datePart = fileName.split('-')[1].split('.')[0];
  const fileDate = new Date(Number(datePart));
  return fileDate >= startDate && fileDate <= endDate;
}

app.get('/download', async (req, res) => {

  const filesString = req.query.param3;
  const files = filesString.split(',');

  console.log('download', files)

  const uploadFolderPath = path.join(__dirname, 'uploads');
  const prefixToMatch = req.query.param2
  const startDate = new Date(req.query.param1);
  const endDate = new Date();

  const mergedFileName = 'merged.pdf';
  const mergedFilePath = path.join(path.join(__dirname, 'merge'), mergedFileName);
  const regex = new RegExp(`^${prefixToMatch}-[0-9]+\\.[A-Za-z]+$`);

  // const fileNames = fs.readdirSync(uploadFolderPath);
  // const pdfFiles = fileNames.filter((fileName) =>
  // fileName.match(prefixToMatch) && fileName.toLowerCase().endsWith('.pdf') &&
  //   isFilenameWithinDateRange(fileName, startDate, endDate)
  // );

  // console.log('pdfFiles', pdfFiles)

  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of files) {
    const pdfBytes = fs.readFileSync(path.join(uploadFolderPath, pdfFile));
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(mergedFilePath, mergedPdfBytes);
  // res.setHeader('Content-Disposition', `attachment; filename="${mergedFileName}"`);
  res.setHeader('Content-Type', 'application/pdf');

  // Send the merged PDF file as the response
  res.sendFile(mergedFilePath);



  // const filePath = path.join(__dirname, 'uploads', 'file-64e660293379f655c89b8afb-1695169308156-77933161.pdf');
  // // const filePath = path.join(uploadFolderPath, );
  // console.log('upoload', filePath)

  // // Check if the file exists 

  // if (fs.existsSync(filePath)) {

  //   // Set the response headers
  //   // res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
  //   // Create a read stream for the file
  //   res.setHeader('Content-Type', 'application/bin');

  //   const fileStream = fs.createReadStream(filePath);

  //   // Pipe the file stream to the response
  // // res.send(fileStream);
  // // res.download(filePath, fileName);
  // // res.sendFile(filePath);
  //   fileStream.pipe(res);
  // } else {
  //   res.status(404).send('File not found');
  // }

})

app.get('/simpledownload', (req, res) => {

  console.log('upoload', req.query.param)

  const filePath = path.join(__dirname, 'uploads', req.query.param);
  // const filePath = path.join(uploadFolderPath, );

  // Check if the file exists 

  if (fs.existsSync(filePath)) {

    // Set the response headers
    // res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    // Create a read stream for the file
    res.setHeader('Content-Type', 'application/bin');

    const fileStream = fs.createReadStream(filePath);

    // Pipe the file stream to the response
    // res.send(fileStream);
    // res.download(filePath, fileName);
    res.sendFile(filePath);
    // fileStream.pipe(res);
  } else {
    res.status(404).send('File not found');
  }

})

// Create an array to hold the Sharp objects representing the images


// Start the server
const port1 = 8888; // Specify the port you want to use
chatServer.listen(port1, () => {
  console.log(`SocketServer listening on port ${port1}`);
});






//DB Config

//Connect to MongoDB
const db = require('./config/keys').mongoURI
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.use('/api/notifications', Notification);

app.use(express.static('client/build'))

if (process.env.NODE_ENV === 'production') {
  //Set static folder

  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
})
const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Server running on port', port));