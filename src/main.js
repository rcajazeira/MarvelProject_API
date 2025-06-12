// backend/server.js
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// CORREÇÃO: URL base da API
const PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY || 'ce24dfc4a1f1386baacffce0107b990784';
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY || 'fb9c3c82bcbfae8726b4203c7ae0c647ad2a0e0';
const API_URL = 'https://gateway.marvel.com/v1/public/'; // <- CORREÇÃO

app.use(cors());
app.use(express.json());

// Função para gerar hash MD5
function generateMarvelHash(ts, privateKey, publicKey) {
    return crypto.createHash('md5')
                 .update(ts + privateKey + publicKey)
                 .digest('hex');
}

// Função para montar URL
function buildMarvelUrl(endpoint, queryParams) {
    const ts = new Date().getTime().toString();
    const hash = generateMarvelHash(ts, PRIVATE_KEY, PUBLIC_KEY);
    
    // URL corrigida
    const url = new URL(`${API_URL}${endpoint}`);
    url.searchParams.append('apikey', PUBLIC_KEY);
    url.searchParams.append('ts', ts);
    url.searchParams.append('hash', hash);

    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    return url;
}

// Handler para endpoints
async function handleMarvelRequest(req, res, endpoint) {
    try {
        const url = buildMarvelUrl(endpoint, req.query);
        const response = await fetch(url);
        
        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({ error });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
}

// Rotas
app.get('/api/characters', (req, res) => handleMarvelRequest(req, res, 'characters'));
app.get('/api/comics', (req, res) => handleMarvelRequest(req, res, 'comics'));
app.get('/api/series', (req, res) => handleMarvelRequest(req, res, 'series'));

app.listen(PORT, () => {
    console.log(`Proxy rodando em http://localhost:${PORT}`);
});
