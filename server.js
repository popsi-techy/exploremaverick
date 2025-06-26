// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/blogs', express.static(path.join(__dirname, 'blogs')));
app.use('/images', express.static(path.join(__dirname, 'images')));


////

app.post('/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send({ error: 'Email is required' });

  const filePath = path.join(__dirname, 'subscribers.json');
  let existing = [];

  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Check for duplicates
  if (existing.find(entry => entry.email === email)) {
    return res.status(409).send({ message: 'Already subscribed' });
  }

  existing.push({ email, subscribedAt: new Date().toISOString() });

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  res.status(200).send({ message: 'Subscribed successfully' });
});

////

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






document.addEventListener("DOMContentLoaded", async () => {
  const blogContainer = document.getElementById("blogContainer");

  // Create Load More button
  const loadMoreBtn = document.createElement("button");
  loadMoreBtn.id = "loadMoreBtn";
  loadMoreBtn.textContent = "Load More";
  loadMoreBtn.className = "mt-8 mx-auto block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700";

  let blogs = [];
  let currentIndex = 0;
  const blogsPerBatch = 6;

  // Convert blogContainer to grid
  blogContainer.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // Fetch blogs
  try {
    const res = await fetch("/all-blogs");
    blogs = await res.json();

    if (blogs.length === 0) {
      blogContainer.innerHTML = `<p class="text-gray-600">No blogs available yet.</p>`;
      return;
    }

    renderNextBatch();

    // Append button only if more blogs exist
    if (blogs.length > blogsPerBatch) {
      blogContainer.parentElement.appendChild(loadMoreBtn);
      loadMoreBtn.addEventListener("click", renderNextBatch);
    }
  } catch (err) {
    blogContainer.innerHTML = `<p class="text-red-600">Error loading blogs.</p>`;
  }

  function renderNextBatch() {
    const nextBatch = blogs.slice(currentIndex, currentIndex + blogsPerBatch);

    nextBatch.forEach(blog => {
      const card = document.createElement("div");
      card.className = "bg-gray-100 p-4 rounded shadow";
      card.innerHTML = `
        <img src="/images/${blog.image}" alt="${blog.title}" class="h-48 w-full object-cover rounded mb-4">
        <h3 class="text-xl font-bold mb-2">${blog.title}</h3>
        <p class="text-gray-600 mb-2">${blog.description}</p>
        <p class="text-sm text-gray-500">By ${blog.author}</p>
        <a href="/blog.html?id=${blog.id}" class="mt-2 inline-block text-blue-600 hover:underline text-sm">Read More</a>
      `;
      blogContainer.appendChild(card);
    });

    currentIndex += blogsPerBatch;

    // Hide button if all blogs are loaded
    if (currentIndex >= blogs.length) {
      loadMoreBtn.classList.add("hidden");
    }
  }
});




// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
