// backend/server.js - Proxy seguro para Marvel API
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações da Marvel API (mantenha em variáveis de ambiente)
const PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY || 'ce24dfc4a1f1386baacffce0107b990784';
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY || 'fb9c3c82bcbfae8726b4203c7ae0c647ad2a0e0';
const API_URL = 'https://gateway.marvel.com/v1/public/';

app.use(cors());
app.use(express.json());

// Função para gerar hash MD5
function generateMarvelHash(ts, privateKey, publicKey) {
    return crypto.createHash('md5')
                 .update(ts + privateKey + publicKey)
                 .digest('hex');
}

// Endpoint proxy para characters
app.get('/api/characters', async (req, res) => {
    try {
        const ts = new Date().getTime().toString();
        const hash = generateMarvelHash(ts, PRIVATE_KEY, PUBLIC_KEY);
        
        const url = new URL(API_URL + 'characters');
        url.searchParams.append('apikey', PUBLIC_KEY);
        url.searchParams.append('ts', ts);
        url.searchParams.append('hash', hash);
        
        // Adiciona parâmetros da query string
        Object.keys(req.query).forEach(key => {
            url.searchParams.append(key, req.query[key]);
        });

        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar characters:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint proxy para comics
app.get('/api/comics', async (req, res) => {
    try {
        const ts = new Date().getTime().toString();
        const hash = generateMarvelHash(ts, PRIVATE_KEY, PUBLIC_KEY);
        
        const url = new URL(API_URL + 'comics');
        url.searchParams.append('apikey', PUBLIC_KEY);
        url.searchParams.append('ts', ts);
        url.searchParams.append('hash', hash);
        
        Object.keys(req.query).forEach(key => {
            url.searchParams.append(key, req.query[key]);
        });

        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar comics:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint proxy para series
app.get('/api/series', async (req, res) => {
    try {
        const ts = new Date().getTime().toString();
        const hash = generateMarvelHash(ts, PRIVATE_KEY, PUBLIC_KEY);
        
        const url = new URL(API_URL + 'series');
        url.searchParams.append('apikey', PUBLIC_KEY);
        url.searchParams.append('ts', ts);
        url.searchParams.append('hash', hash);
        
        Object.keys(req.query).forEach(key => {
            url.searchParams.append(key, req.query[key]);
        });

        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar series:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// package.json
/*
{
  "name": "marvel-api-proxy",
  "version": "1.0.0",
  "description": "Proxy seguro para Marvel API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/
