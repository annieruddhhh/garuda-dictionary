
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const recentContainer = document.getElementById("recentSearches");

let dictionary = [];
let recentSearches = JSON.parse(localStorage.getItem("garudaRecent") || "[]");
let bookmarks = JSON.parse(localStorage.getItem("garudaBookmarks") || "[]");

async function loadDictionary() {
    try {
        const response = await fetch("./data/dictionary.json");
        if (!response.ok) throw new Error("Dictionary failed to load");
        dictionary = await response.json();
        renderRecentSearches();
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load dictionary</h3>
                <p>Run the app using Live Server.</p>
            </div>`;
    }
}

function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


function levenshteinDistance(a, b) {
    const matrix = Array.from(
        { length: a.length + 1 },
        (_, i) => Array(b.length + 1).fill(i)
    );

    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[a.length][b.length];
}

function searchDictionary(query) {
    const q = normalizeText(query);

    if (!q) return [];

    return dictionary
        .map(entry => {
            const words = [
                entry.headword,
                entry.transliteration,
                ...entry.romanised,
                ...entry.meanings
            ].map(normalizeText);

            const exactMatch = words.some(word => word.includes(q));

            const fuzzyMatch = words.some(word =>
                word.length >= 4 &&
                q.length >= 4 &&
                levenshteinDistance(q, word) <=
                    (q.length >= 7 ? 2 : 1)
            );

            return {
                entry,
                score: exactMatch ? 2 : fuzzyMatch ? 1 : 0
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.entry);
}


function saveRecentSearch(query) {
    const q = query.trim();
    if (!q) return;

    recentSearches = [
        q,
        ...recentSearches.filter(item => normalizeText(item) !== normalizeText(q))
    ].slice(0, 5);

    localStorage.setItem("garudaRecent", JSON.stringify(recentSearches));
    renderRecentSearches();
}

function renderRecentSearches() {
    if (!recentContainer) return;

    if (!recentSearches.length) {
        recentContainer.innerHTML = "";
        return;
    }

    recentContainer.innerHTML = `
        <span class="recent-label">Recent:</span>
        ${recentSearches.map((item, index) =>
            `<button class="recent-chip" data-index="${index}">${item}</button>`
        ).join("")}
    `;

    recentContainer.querySelectorAll(".recent-chip").forEach(button => {
        button.addEventListener("click", () => {
            searchInput.value = recentSearches[button.dataset.index];
            performSearch();
        });
    });
}

function toggleBookmark(id) {
    if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(item => item !== id);
    } else {
        bookmarks.push(id);
    }

    localStorage.setItem("garudaBookmarks", JSON.stringify(bookmarks));
    displayResults(searchDictionary(searchInput.value));
}

function displayResults(entries) {
    resultsContainer.innerHTML = "";
    resultCount.textContent = `${entries.length} ${entries.length === 1 ? "word" : "words"} found`;

    if (!entries.length) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No words found</h3>
                <p>Try another spelling or search in Devanagari.</p>
            </div>`;
        return;
    }

    entries.forEach(entry => {
        const saved = bookmarks.includes(entry.id);
        const card = document.createElement("article");
        card.className = "word-card";

        card.innerHTML = `
            <div class="word-card-header">
                <span class="word-type">${entry.pos}</span>
                <button class="bookmark-button ${saved ? "saved" : ""}" type="button">
                    ${saved ? "★ Saved" : "☆ Save"}
                </button>
            </div>
            <h2 class="word-head">${entry.headword}</h2>
            <p class="word-transliteration">${entry.transliteration}</p>
            <p class="word-meaning">${entry.meanings.join(", ")}</p>
            <button class="details-button" type="button">View details →</button>
        `;

        card.querySelector(".bookmark-button").addEventListener("click", () => {
            toggleBookmark(entry.id);
        });

        card.querySelector(".details-button").addEventListener("click", () => {
            showEntryDetails(entry);
        });

        resultsContainer.appendChild(card);
    });
}

function showEntryDetails(entry) {
    resultsContainer.innerHTML = `
        <article class="detail-card">
            <button class="back-button" id="backButton">← Back to results</button>
            <p class="word-type">${entry.pos}</p>
            <h2 class="detail-head">${entry.headword}</h2>
            <p class="word-transliteration">${entry.transliteration}</p>

            <div class="detail-section">
                <h3>Meanings</h3>
                <p>${entry.meanings.join(", ")}</p>
            </div>
            <div class="detail-section">
                <h3>Romanised spellings</h3>
                <p>${entry.romanised.join(", ")}</p>
            </div>
            <div class="detail-section">
                <h3>Example</h3>
                <p class="example-text">${entry.example}</p>
            </div>
            <button class="bookmark-button ${bookmarks.includes(entry.id) ? "saved" : ""}" id="detailBookmark">
                ${bookmarks.includes(entry.id) ? "★ Saved" : "☆ Save bookmark"}
            </button>
        </article>`;

    document.getElementById("backButton").addEventListener("click", () => {
        displayResults(searchDictionary(searchInput.value));
    });

    document.getElementById("detailBookmark").addEventListener("click", () => {
        toggleBookmark(entry.id);
        showEntryDetails(entry);
    });
}

function performSearch() {
    const query = searchInput.value;
    saveRecentSearch(query);
    displayResults(searchDictionary(query));
}

searchButton.addEventListener("click", performSearch);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") performSearch();
});

loadDictionary();
