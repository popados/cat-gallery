// Fetch posts index and render list; render selected markdown post
async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
}

function makePostItem(post) {
    const div = document.createElement('div');
    div.className = 'post-item';
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = post.title;
    a.addEventListener('click', (e) => {
        e.preventDefault();
        loadPost(post.path);
    });
    const meta = document.createElement('div');
    meta.className = 'post-excerpt';
    meta.textContent = post.excerpt || '';
    div.appendChild(a);
    div.appendChild(meta);
    return div;
}

async function loadPost(path) {
    const contentEl = document.getElementById('post-content');
    const titleEl = document.getElementById('post-title');
    const metaEl = document.getElementById('post-meta');
    const bodyEl = document.getElementById('post-body');

    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('Post not found');
        const md = await res.text();
        const html = marked.parse(md);
        // Simple front-matter parsing for title/date if present
        let title = '';
        const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
            const fm = fmMatch[1];
            const titleMatch = fm.match(/title:\s*(.*)/i);
            const dateMatch = fm.match(/date:\s*(.*)/i);
            if (titleMatch) title = titleMatch[1].replace(/\"/g,'').trim();
            metaEl.textContent = dateMatch ? dateMatch[1].trim() : '';
        } else {
            title = path.split('/').pop();
        }

        titleEl.textContent = title;
        bodyEl.innerHTML = html;
        document.getElementById('posts-list').style.display = 'none';
        contentEl.style.display = '';
    } catch (err) {
        alert('Could not load post: ' + err.message);
    }
}

async function init() {
    const listEl = document.getElementById('posts-list');
    const contentEl = document.getElementById('post-content');
    const back = document.getElementById('back-to-list');
    back.addEventListener('click', (e)=>{
        e.preventDefault();
        contentEl.style.display = 'none';
        listEl.style.display = '';
    });

    try {
        const index = await fetchJSON('posts/posts.json');
        index.posts.forEach(p => listEl.appendChild(makePostItem(p)));
        // Optionally load a post if ?post=path is provided
        const params = new URLSearchParams(location.search);
        const postParam = params.get('post');
        if (postParam) loadPost(postParam);
    } catch (err) {
        listEl.textContent = 'Unable to load posts.';
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', init);
