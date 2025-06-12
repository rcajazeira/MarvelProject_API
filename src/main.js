const publicKey = 'ce24fdfc4a1f1386baacffce0107b990784';
const privateKey = 'f8bc3d7bcffbae87726b4703b7aed064c47ad9e0';
const apiUrl = 'https://gateway.marvel.com/v1/public/';

async function fetchData(endpoint, params = {}) {
    const ts = new Date().getTime();
    const hash = md5(ts + privateKey + publicKey);
    const url = new URL(apiUrl + endpoint);

    url.searchParams.append('apikey', publicKey);
    url.searchParams.append('ts', ts);
    url.searchParams.append('hash', hash);

    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data.results;
    } catch (error) {
        console.error('Erro ao buscar dados da Marvel API:', error);
        displayMessage('Erro ao carregar dados da Marvel.');
        return [];
    }
}

function displayResults(results) {
    const searchResultsContainer = document.getElementById('search-results');
    if (!searchResultsContainer) {
        console.error('Elemento search-results não encontrado.');
        return;
    }

    searchResultsContainer.innerHTML = '';

    if (results.length === 0) {
        displayMessage('Nenhum resultado encontrado.');
        return;
    }

    results.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('search-results__item');

        let thumbnailPath = 'placeholder.jpg';
        if (item.thumbnail && item.thumbnail.path && !item.thumbnail.path.includes('image_not_available')) {
            thumbnailPath = `${item.thumbnail.path}.${item.thumbnail.extension}`;
        }

        let itemType = item._type || '';
        let title = item.name || item.title || 'Título Desconhecido';
        let description = item.description || 'Sem descrição disponível.';
        let additionalInfo = '';
        let detailLink = item.urls?.find(url => url.type === 'detail')?.url || '#';

        if (itemType === 'characters') {
            if (item.comics?.available > 0) additionalInfo += `<li>Participa em ${item.comics.available} quadrinhos</li>`;
            if (item.series?.available > 0) additionalInfo += `<li>Presente em ${item.series.available} séries</li>`;
            if (item.events?.available > 0) additionalInfo += `<li>Participou de ${item.events.available} eventos</li>`;
        } else if (itemType === 'comics') {
            const onsaleDate = item.dates?.find(d => d.type === 'onsaleDate')?.date;
            if (onsaleDate) additionalInfo += `<p>Publicado em: ${new Date(onsaleDate).toLocaleDateString()}</p>`;
            if (item.creators && item.creators.items.length > 0) {
                additionalInfo += `<p>Criadores: ${item.creators.items.map(c => c.name).join(', ')}</p>`;
            }
        } else if (itemType === 'series') {
            additionalInfo += `<p>Início: ${item.startYear || 'N/A'} - Fim: ${item.endYear || 'N/A'}</p>`;
        }

        itemDiv.innerHTML = `
            <img src="${thumbnailPath}" alt="${title}">
            <div class="search-results__item-info">
                <h2>${title}</h2>
                <p>${description}</p>
                ${additionalInfo}
                <a href="${detailLink}" target="_blank">Ver detalhes</a>
            </div>
        `;
        searchResultsContainer.appendChild(itemDiv);
    });
}

function displayMessage(message) {
    const searchResultsContainer = document.getElementById('search-results');
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = `<p class="message">${message}</p>`;
    }
}

function showLoader() {
    const searchResultsContainer = document.getElementById('search-results');
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = '<div class="loader"></div>';
    }
}

async function handleSearch(searchTerm) {
    showLoader();
    const characterResults = await fetchData('characters', { nameStartsWith: searchTerm, limit: 10 });
    const comicResults = await fetchData('comics', { titleStartsWith: searchTerm, limit: 10 });
    const seriesResults = await fetchData('series', { titleStartsWith: searchTerm, limit: 10 });

    const allResults = [
        ...characterResults.map(c => ({ ...c, _type: 'characters' })),
        ...comicResults.map(c => ({ ...c, _type: 'comics' })),
        ...seriesResults.map(s => ({ ...s, _type: 'series' }))
    ];

    displayResults(allResults);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                handleSearch(searchTerm);
            } else {
                displayMessage('Digite algo para pesquisar no Universo Marvel.');
            }
        });
    } else {
        console.error('Formulário de busca ou campo de entrada não encontrado.');
    }

    displayMessage('Explore o Universo Marvel! Digite para pesquisar personagens, quadrinhos e séries.');
});

// Função MD5
function md5(string) {
    // A função md5 permanece a mesma, pois é complexa e específica para gerar o hash MD5.
    // Certifique-se de que esta função está sendo chamada corretamente.
    // ...
}

