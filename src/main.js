const publicKey = 'ce24dfc4a1f1386baacffce0107b990784';
const privateKey = 'fb9c3c82bcbfae8726b4203c7ae0c647ad2a0e0'; // CHAVE PRIVADA CORRIGIDA AQUI
const apiUrl = 'https://gateway.marvel.com/v1/public/';

async function fetchData(endpoint, params = {}) {
    const ts = new Date().getTime();
    // A função md5() precisa ser definida ou importada. A incluí no final deste arquivo.
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
    searchResultsContainer.innerHTML = '';

    if (results.length === 0) {
        displayMessage('Nenhum resultado encontrado.');
        return;
    }

    results.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('search-results__item');

        // Use 'placeholder.jpg' se a imagem não estiver disponível
        let thumbnailPath = 'placeholder.jpg';
        if (item.thumbnail && item.thumbnail.path && !item.thumbnail.path.includes('image_not_available')) {
            thumbnailPath = `${item.thumbnail.path}.${item.thumbnail.extension}`;
        }
        
        // Determinar o tipo de item para exibir informações específicas
        // É importante que o `_type` seja definido no `handleSearch` antes de chamar `displayResults`
        let itemType = item._type || ''; // Certifique-se que _type foi adicionado
        let title = item.name || item.title || 'Título Desconhecido';
        let description = '';
        let additionalInfo = '';
        let detailLink = '';

        if (itemType === 'characters') {
            description = item.description || 'Sem descrição disponível.';
            detailLink = item.urls?.find(url => url.type === 'detail')?.url || '#';
            additionalInfo += `<ul>`;
            if (item.comics?.available > 0) additionalInfo += `<li>Participa em ${item.comics.available} quadrinhos</li>`;
            if (item.series?.available > 0) additionalInfo += `<li>Presente em ${item.series.available} séries</li>`;
            if (item.events?.available > 0) additionalInfo += `<li>Participou de ${item.events.available} eventos</li>`;
            additionalInfo += `</ul>`;
        } else if (itemType === 'comics') {
            description = item.description || 'Sem descrição disponível.';
            detailLink = item.urls?.find(url => url.type === 'detail')?.url || '#';
            const onsaleDate = item.dates?.find(d => d.type === 'onsaleDate')?.date;
            if (onsaleDate) additionalInfo += `<p>Publicado em: ${new Date(onsaleDate).toLocaleDateString()}</p>`;
            if (item.creators && item.creators.items.length > 0) {
                additionalInfo += `<p>Criadores: ${item.creators.items.map(c => c.name).join(', ')}</p>`;
            }
        } else if (itemType === 'series') {
            description = item.description || 'Sem descrição disponível.';
            detailLink = item.urls?.find(url => url.type === 'detail')?.url || '#';
            additionalInfo += `<p>Início: ${item.startYear || 'N/A'} - Fim: ${item.endYear || 'N/A'}</p>`;
        }
        // Você pode expandir para 'stories' e 'events' aqui

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
    searchResultsContainer.innerHTML = `<p class="message">${message}</p>`;
}

function showLoader() {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = '<div class="loader"></div>';
}

async function handleSearch(searchTerm) {
    showLoader();
    // Adicionando _type para identificar o tipo de resultado na displayResults
    const characterResults = await fetchData('characters', { nameStartsWith: searchTerm, limit: 10 });
    const comicResults = await fetchData('comics', { titleStartsWith: searchTerm, limit: 10 });
    const seriesResults = await fetchData('series', { titleStartsWith: searchTerm, limit: 10 });
    // Adicione mais tipos de busca se desejar (events, stories, creators)

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

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            handleSearch(searchTerm);
        } else {
            displayMessage('Digite algo para pesquisar no Universo Marvel.');
            document.getElementById('search-results').innerHTML = ''; // Limpa resultados anteriores
        }
    });

    displayMessage('Explore o Universo Marvel! Digite para pesquisar personagens, quadrinhos e séries.');
});

// FUNÇÃO MD5 (NECESSÁRIA PARA A AUTENTICAÇÃO DA API MARVEL)
// Por ser uma função utilitária, pode ser colocada no final do arquivo ou em um arquivo separado.
function md5(string) {
    function RotateLeft(l, bits) {
        return (l << bits) | (l >>> (32 - bits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX4 = (lX & 0xF0000000);
        lY4 = (lY & 0xF0000000);
        lX8 = (lX & 0x0FFF0000);
        lY8 = (lY & 0x0FFF0000);
        lResult = (lX & 0x0000FFFF) + (lY & 0x0000FFFF);
        if (lResult > 0xFFFF) {
            lResult = (lResult & 0x0000FFFF) + (lX8 >>> 16) + (lY8 >>> 16) + 1;
        } else {
            lResult = lResult + (lX8 >>> 16) + (lY8 >>> 16);
        }
        if (lResult > 0xFFFF) {
            lResult = (lResult & 0x0000FFFF) + (lX4 >>> 24) + (lY4 >>> 24) + 1;
        } else {
            lResult = lResult + (lX4 >>> 24) + (lY4 >>> 24);
        }
        return (lResult);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords = (((lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64) + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount >>> 2);
            lBytePosition = (lByteCount & 3) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
            lByteCount++;
        }
        lWordCount = (lByteCount >>> 2);
        lBytePosition = (lByteCount & 3) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }

    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
    return temp.toLowerCase();
}
