const booksContainer = document.querySelector("div.booksContainer");
const sInp = document.querySelector("input.searchInput");
const targetSelect = document.querySelector("select#targetSelect");
const detailsOverlay = document.querySelector(".detailsOverlay");
const detailsImage = document.querySelector(".detailsImage");
const detailsTitle = document.querySelector(".detailsTitle");
const detailsAuthor = document.querySelector(".detailsAuthor");
const detailsSummary = document.querySelector(".detailsSummary");
const overlayCloseButton = document.querySelector(".overlayCloseButton");
const ldCheckBox = document.querySelector("#ldBox");
const searchIcon = '<i class="fas fa-search" id="searchIcon"></i>';
const clearSearchIcon = '<i class="fas fa-times-circle" id="deleteSearchIcon"></i>';
const amountResults = document.querySelector("span.amountResults");  // TODO: rename deprecated items

const ldVars = [
  {name: "--bg-color", light: "#f5f5f5", dark: "#0e0b16"},
  {name: "--txt-color", light: "#0f1626", dark: "#e7dfdd"},
  {name: "--border-clr", light: "#000000", dark: "#a239ca"},
]

let language = localStorage.getItem("andreasEcke.language") ?? "de";
let ldMode = localStorage.getItem("andreasEcke.darkMode") ?? "dark";
let limitedBooks;

if (ldMode === "dark") {
  switchLDMode("dark");
  ldCheckBox.checked = true;
}

ldCheckBox.addEventListener("change", e => {
  if (e.target.checked) {
    switchLDMode("dark");
    localStorage.setItem("andreasEcke.darkMode", "dark");
  }
  else {
    switchLDMode("light");
    localStorage.setItem("andreasEcke.darkMode", "light");
  }
});

targetSelect.addEventListener("change", e => {
  if (sInp.value) onSearch(targetSelect.value, sInp.value);
});

amountResults.addEventListener("click", e => {
  if (sInp.value && e.currentTarget.innerHTML.includes('id="deleteSearchIcon"')) {
    onSearch("books", "");
    sInp.value = "";
  } else if(sInp.value && e.currentTarget.innerHTML.includes('id="searchIcon"')) onSearch(targetSelect.value, sInp.value);
});

/**
 * Creates a tile to be put inside booksContainer, containing the books information.
 * 
 * @param {Object} bookObj - Object containing the book's data
 * @return {HTMLElement}
 */
function createBookTile(bookObj) {
  const tile = document.createElement("div");
  tile.classList.add("bookTile");
  tile.dataset.bookId = bookObj.id;

  // load the image
  const path = "/media" + bookObj.cover.slice(1, -4) + "_small" + ".jpg";  // TODO: change to complement all file formats
  const img = document.createElement("img");
  img.src = path;
  img.classList.add("bookImage");

  // create info-container
  const infos = document.createElement("div"); 
  infos.classList.add("bookInfo");

  const name = document.createElement("p");
  name.innerText = bookObj.name;
  name.classList.add("standOutish");

  const von = document.createElement("p");
  von.innerText = language === "de" ? "von" : "by";

  const author = document.createElement("p");
  author.innerText = bookObj.author;
  author.classList.add("standOutish");

  // merge the infos
  infos.appendChild(name);
  infos.appendChild(von);
  infos.appendChild(author);

  // create final tile
  tile.appendChild(img);
  tile.append(infos);
  tile.addEventListener("click", displayDetails)
  return tile;
}

/**
 * Get and display detailed info of clicked book.
 * 
 * @param {Event} e - the triggered event
 */
function displayDetails(e) {
  if (!window.getSelection().isCollapsed && e.target.tagName.toLowerCase() !== "img") return;  // in case the user tries to select/copy

  const bookId = e.currentTarget.dataset.bookId;
  const targetBook = limitedBooks.filter(book => book.id === Number(bookId))[0];  // id is unique, filter should therefore only return one book
  if (!targetBook) {
    console.log("Bad Id in displayDetails!");
    return;
  }

  modifyDetailDisplay(targetBook);
  detailsOverlay.classList.add("visible");
}

overlayCloseButton.addEventListener("click", e => {
  detailsOverlay.classList.remove("visible");
});

/**
 * Modifies detailsOverlay to contain information about chosen book.
 * 
 * @param {Object} bookObj - Object containing the books data
 */
function modifyDetailDisplay(bookObj) {
  detailsImage.src = "/media" + bookObj.cover.substring(1);
  detailsTitle.textContent = bookObj.name;
  detailsAuthor.textContent = bookObj.author
  const languageProperty = "desc_" + language;
  const summarySourceStartIndex = bookObj[languageProperty].lastIndexOf("(");
  const summary = bookObj[languageProperty].substring(0, summarySourceStartIndex);
  let source = bookObj[languageProperty].substring(summarySourceStartIndex);  // Brackets at the end contain source of summary.
  source = source.substring(1, source.lastIndexOf(")"));  // in case of trailing '\n'
  if (source === "ME") source = language === "de" ? "Englische Zusammenfassung übersetzt." : "German summary translated.";
  detailsSummary.textContent = summary + "\n\n" + (language === "de" ? "Quelle: " : "Source: ") + source;
}

/**
 * Display all books within passed list.
 * 
 * @param {List} booksToDisplay - list of books to be displayed
 */
function displayBooks(booksToDisplay) {
  booksContainer.innerHTML = "";
  booksToDisplay.forEach(book => {
    booksContainer.appendChild(createBookTile(book));
  });
}

/**
 * Limits displayed books based on passed keyword.
 * 
 * @param {String} keyword - keyword to compare to
 */
async function onSearch(target, keyword) {
  target = target.toLowerCase() === "books" ? "name" : "author";
  try {
    const response = await fetch("/probe/bookApi/", {
      method: "POST",
      mode: "same-origin",
      cache: "no-cache",
      headers: {"Content-Type": "application/json"},
      body: target + "=" + keyword,
    });

  limitedBooks = await response.json();
  } catch(error) {
    console.log("Error in 'onSearch': ", error);
    return;
  }
  if (keyword !== "") {
    amountResults.innerHTML = clearSearchIcon;
  } else {
    amountResults.innerHTML = searchIcon;
  }
  displayBooks(limitedBooks);
}

let debouncer;
sInp.addEventListener("keydown", e => {
  clearTimeout(debouncer);
  debouncer = setTimeout(_ => {
    onSearch(targetSelect.value, sInp.value);
  }, 500);
});
onSearch("books", "");  // no keyword = all books

sInp.addEventListener("paste", e => {
  const paste = (e.clipboardData || window.clipboardData).getData('text')
  onSearch(targetSelect.value, paste);
});

/**
 * switch to light- or dark-mode.
 * 
 * @param {string} mode - either "light" or "dark" for mode to switch to
 */
function switchLDMode(mode) {
  mode = mode.toLowerCase();
  if (mode !== "light" && mode !== "dark") return;
  for (ldVar of ldVars) document.documentElement.style.setProperty(ldVar.name, ldVar[mode]);
}