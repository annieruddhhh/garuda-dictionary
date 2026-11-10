
# Garuda Dictionary

A bilingual Hindi dictionary that supports Devanagari and Romanised search, with meanings, transliteration, examples, bookmarks, and typo-tolerant matching.

## Features

- Search in Devanagari and Romanised Hindi.
- 50 dictionary entries.
- Word meanings and example sentences.
- Detailed dictionary entry view.
- Recent searches.
- Bookmarks saved using localStorage.
- Typo-tolerant search.
- Responsive interface.
- Works offline after initial loading when deployed with caching support (planned improvement).

## Tech Stack

- HTML5
- CSS3
- JavaScript
- JSON
- Browser localStorage

## Setup

1. Clone the repository.
2. Open the project in VS Code.
3. Install the Live Server extension.
4. Open `index.html` using Live Server.

## Project Structure

```text
garuda-dictionary/
├── index.html
├── style.css
├── script.js
├── data/
│   └── dictionary.json
└── README.md
```

## Search Examples

| Input | Result |
|---|---|
| shiksha | शिक्षा |
| शिक्षा | शिक्षा |
| dharma | धर्म |
| प्रेम | प्रेम |

## Trade-offs

- Dictionary data is stored locally in JSON.
- Search is client-side.
- Fuzzy matching uses Levenshtein distance.
- Bookmarks and recent searches use browser localStorage.
- No backend or database is required.

## Future Improvements

- Expand dictionary to 500+ words.
- Add proper pronunciation audio.
- Add Sanskrit grammatical information.
- Implement a Progressive Web App for offline support.
- Improve transliteration using a dedicated transliteration engine.

## AI Usage

AI tools were used for assistance with implementation, debugging, documentation, and feature development. All generated code was reviewed and tested during development.

## Author

Anirudh Singla
