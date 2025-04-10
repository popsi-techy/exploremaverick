// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/blogs', express.static(path.join(__dirname, 'blogs')));
app.use('/images', express.static(path.join(__dirname, 'images')));


// Create folders if not exist
['blogs', 'images'].forEach((folder) => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
});

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Route: Submit Blog
app.post('/submit-blog', upload.single('image'), (req, res) => {
  const { title, author, description, content } = req.body;
  const image = req.file.filename;
  const id = Date.now();
  const blogData = { id,
    title,
    author,
    image,
    description,
    content };

  const filePath = `blogs/blog-${id}.json`;
  fs.writeFileSync(filePath, JSON.stringify(blogData, null, 2));
  res.status(200).json({ message: 'Blog saved!', id });
});

// Route: Get All Blogs
app.get('/all-blogs', (req, res) => {
  const files = fs.readdirSync('./blogs');
  const blogs = files.map((file) => {
    const data = fs.readFileSync(`./blogs/${file}`);
    return JSON.parse(data);
  });
  res.json(blogs.reverse()); // Show latest first
});

// Route: Get Blog by ID
app.get('/blog/:id', (req, res) => {
  const blogFile = `./blogs/blog-${req.params.id}.json`;
  if (fs.existsSync(blogFile)) {
    const data = fs.readFileSync(blogFile);
    res.json(JSON.parse(data));
  } else {
    res.status(404).json({ error: 'Blog not found' });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
