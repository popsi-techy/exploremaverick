document.addEventListener('DOMContentLoaded', () => {
    fetch('/all-blogs')
      .then(res => res.json())
      .then(blogs => {
        const container = document.getElementById('blogContainer');
        blogs.forEach(blog => {
          const card = document.createElement('div');
          card.className = 'max-w-sm bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform transform hover:scale-105 flex-shrink-0';
          card.innerHTML = `
            <img src="/images/${blog.image}" alt="${blog.title}" class="h-48 w-full object-cover">
            <div class="p-4">
              <P class="text-gray-700 text-sm line-clamp-3">${new Date(blog.id).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</P>
              <h3 class="text-xl font-bold mb-2">${blog.title}</h3>
              <p class="text-sm text-gray-600 mb-2">By ${blog.author}</p>
              <p class="text-gray-700 text-sm mb-4">${blog.description}</p>
            </div>
          `;
          card.onclick = () => {
            window.location.href = `blog.html?id=${blog.id}`;
          };
          container.appendChild(card);
        });
      });
  });
  