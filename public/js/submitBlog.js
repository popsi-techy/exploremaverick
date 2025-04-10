// js/submitBlog.js
console.log('Script loaded');
document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
  
    const res = await fetch('/submit-blog', {
      method: 'POST',
      body: formData
    });
  
    const data = await res.json();
    alert('Blog posted successfully!');
    window.location.href = `blog.html?id=${data.id}`;
  });
  