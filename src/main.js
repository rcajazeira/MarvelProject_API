const publicKey = 'ce24dfc4af1386baacfce0107b990784';
const privateKey = 'fb9c3c82bcfbae8726b4203c7ae0c647ad2a06e0';

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');
const loader = document.getElementById('loader');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  loader.style.display = 'block';
  resultsDiv.innerHTML = '';

  const ts = Date.now().toString();
  const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();

  const url = `https://gateway.marvel.com/v1/public/characters?nameStartsWith=${encodeURIComponent(query)}&ts=${ts}&apikey=${publicKey}&hash=${hash}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    loader.style.display = 'none';

    if (data.data.results.length === 0) {
      resultsDiv.innerHTML = `<p>Nenhum personagem encontrado.</p>`;
      return;
    }

    data.data.results.forEach(hero => {
      const heroCard = `
        <div class="hero-card">
          <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" alt="${hero.name}" />
          <h3>${hero.name}</h3>
          <p>${hero.description || 'Sem descrição disponível.'}</p>
        </div>
      `;
      resultsDiv.innerHTML += heroCard;
    });
  } catch (error) {
    loader.style.display = 'none';
    resultsDiv.innerHTML = `<p>Erro ao buscar personagem 😢</p>`;
    console.error('Erro:', error);
  }
});
