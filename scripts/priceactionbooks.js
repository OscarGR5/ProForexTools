document.addEventListener("DOMContentLoaded", () => {
    fetch('json_files/books_database.json')
        .then(response => response.json())
        .then(data => {
            const booksList = document.getElementById('books-list');
            data["price-action"].forEach(book => {
                   const children = `
                    <div class="book">
                        <a href="${book.link}" target="_blank"><img src="${book.image}" alt="${book.title} Cover"></a>
                    </div>
                    <div class="book-info">
                        <h2>${book.title}</h2>
                        <p>Author: ${book.author}</p>
                        <p>My opinion: ${book.opinion}</p>
                        <a href="${book.link}" target="_blank" class="buy-link">Buy on Amazon</a>
                    </div>
                `;
                
                booksList.innerHTML += children;
            });
        })
        .catch(error => console.error('Error fetching books:', error));
});