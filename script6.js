const addBooksection = document.querySelector(".add-book-section");
const toggleFormBtn = document.getElementById("toggle-form");
const typeSelect = document.getElementById("type");
const ebookDetails = document.getElementById("ebook-details");
const bookForm = document.getElementById("book-form");
const bookList = document.getElementById("book-list");

let books = [];

toggleFormBtn.addEventListener("click", () => {
  if (addBooksection.style.display === "none") {
    addBooksection.style.display = "block";
    toggleFormBtn.textContent = "Hide Form";
  } else {
    addBooksection.style.display = "none";
    toggleFormBtn.textContent = "Add New Book";
  }
});

typeSelect.addEventListener("change", () => {
  if (typeSelect.value === "ebook") {
    ebookDetails.style.display = "block";
  } else {
    ebookDetails.style.display = "none";
  }
});

class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
    this.id = Date.now();
    this.type = "physical";
    this.available = true;
    this.borrower = null;
  }

  borrow(name) {
    this.borrower = name;
    this.available = false;
  }

  markReturned() {
    this.borrower = null;
    this.available = true;
  }

  getHTML() {
    const card = document.createElement("div");

    card.className = `book-card ${
      this.available ? "available" : "borrowed"
    }`;

    card.dataset.id = this.id;

    const statusText = this.available
      ? "Available"
      : `Borrowed by ${this.borrower}`;

    const actionBtn = this.available
      ? `<button class="btn btn-borrow">Borrow</button>`
      : `<button class="btn btn-return">Return</button>`;

    card.innerHTML = `
      <h3 class="book-title">${this.title}</h3>
      <div class="book-meta">Author: ${this.author}</div>
      <div class="book-meta">Status: ${statusText}</div>
      <div class="book-actions">
        ${actionBtn}
        <button class="btn btn-remove">Remove</button>
      </div>
    `;

    return card;
  }
}

class Ebook extends Book {
  constructor(title, author, fileSize) {
    super(title, author);
    this.type = "ebook";
    this.fileSize = fileSize;
  }

  borrow(name) {
    this.borrower = name;
  }

  markReturned() {
    this.borrower = null;
  }

  getHTML() {
    const card = document.createElement("div");

    card.className = "book-card ebook";
    card.dataset.id = this.id;

    const statusText = this.borrower
      ? `Downloaded by ${this.borrower}`
      : "Available";

    const actionBtn = this.borrower
      ? `<button class="btn btn-return">Return</button>`
      : `<button class="btn btn-borrow">Download</button>`;

    card.innerHTML = `
      <h3 class="book-title">${this.title}</h3>
      <div class="book-meta">Author: ${this.author}</div>
      <div class="book-meta">File Size: ${this.fileSize} MB</div>
      <div class="book-meta">Status: ${statusText}</div>
      <div class="book-actions">
        ${actionBtn}
        <button class="btn btn-remove">Remove</button>
      </div>
    `;

    return card;
  }
}

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;

  let book;

  if (typeSelect.value === "ebook") {
    const fileSize = document.getElementById("file-size").value;
    book = new Ebook(title, author, fileSize);
  } else {
    book = new Book(title, author);
  }

  books.push(book);

  saveBooks();
  displayBooks();

  bookForm.reset();
  ebookDetails.style.display = "none";
});

function displayBooks() {
  bookList.innerHTML = "";

  if (books.length === 0) {
    bookList.innerHTML = "<p>No Books Found</p>";
    return;
  }

  books.forEach((book) => {
    const card = book.getHTML();
    bookList.appendChild(card);
  });

  attachEvents();
}

function borrowBooks(bookId, borrowerName) {
  const book = books.find((book) => book.id == bookId);

  if (book) {
    book.borrow(borrowerName);
  }

  saveBooks();
  displayBooks();
}

function returnBooks(bookId) {
  const book = books.find((book) => book.id == bookId);

  if (book) {
    book.markReturned();
  }

  saveBooks();
  displayBooks();
}

function removeBooks(bookId) {
  books = books.filter((book) => book.id != bookId);

  saveBooks();
  displayBooks();
}

function attachEvents() {
  const borrowBtns = document.querySelectorAll(".btn-borrow");

  borrowBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookId = btn.closest(".book-card").dataset.id;

      const borrowerName = prompt("Enter your name");

      if (borrowerName) {
        borrowBooks(bookId, borrowerName);
      }
    });
  });

  const returnBtns = document.querySelectorAll(".btn-return");

  returnBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookId = btn.closest(".book-card").dataset.id;
      returnBooks(bookId);
    });
  });

  const removeBtns = document.querySelectorAll(".btn-remove");

  removeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const confirmDelete = confirm(
        "Are you sure you want to remove this book?"
      );

      if (!confirmDelete) return;

      const bookId = btn.closest(".book-card").dataset.id;

      removeBooks(bookId);
    });
  });
}

function saveBooks() {
  localStorage.setItem("booksArray", JSON.stringify(books));
}

function loadBooks() {
  const storedBooks = localStorage.getItem("booksArray");

  if (!storedBooks) return;

  const bookObjects = JSON.parse(storedBooks);

  books = bookObjects.map((obj) => {
    let book;

    if (obj.type === "ebook") {
      book = new Ebook(
        obj.title,
        obj.author,
        obj.fileSize
      );
    } else {
      book = new Book(
        obj.title,
        obj.author
      );
    }

    book.id = obj.id;
    book.available = obj.available;
    book.borrower = obj.borrower;

    return book;
  });

  displayBooks();
}

loadBooks();