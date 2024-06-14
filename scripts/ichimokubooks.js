document.addEventListener("DOMContentLoaded", () => {
    fetch('json_files/books_database.json')
        .then(response => response.json())
        .then(data => {
            const booksList = document.getElementById('ichbooks-list');
            data.ichbooks.forEach(book => {
                   const children = `
                    <div class="ichbook">
                        <a href="${book.link}" target="_blank"><img src="${book.image}" alt="${book.title} Cover"></a>
                        <a href="${book.link}" target="_blank" class="ich-buy-link">Buy on Amazon</a>
                    </div>
                `;
                
                booksList.innerHTML += children;
            });
        })
        .catch(error => console.error('Error fetching books:', error));
});
