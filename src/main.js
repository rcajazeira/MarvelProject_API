// backend/server.js - Proxy seguro para Marvel API
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações da Marvel API (mantenha em variáveis de ambiente)
const PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY || 'ce24dfc4a1f1386baacffce0107b990784';
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY || 'fb9c3c82bcbfae8726b4203c7ae0c647ad2a0e0';
const API_URL = 'https://gateway.marvel.com/v1/public/';

app.use(cors());
app.use(express.json());

// Função para gerar hash MD5 conforme Marvel API
function generateMarvelHash(ts, privateKey, publicKey) {
    return crypto.createHash('md5')
                 .update(ts + privateKey + publicKey)
                 .digest('hex');
}

// Função auxiliar para montar URL com autenticação e query params
function buildMarvelUrl(endpoint, queryParams) {
    const ts = new Date().getTime().toString();
    const hash = generateMarvelHash(ts, PRIVATE_KEY, PUBLIC_KEY);
    
    // Construir URL corretamente
    const baseUrl = new URL(API_URL);
    const endpointUrl = new URL(endpoint, baseUrl);
    
    // Adicionar parâmetros de autenticação
    endpointUrl.searchParams.append('apikey', PUBLIC_KEY);
    endpointUrl.searchParams.append('ts', ts);
    endpointUrl.searchParams.append('hash', hash);

    // Adicionar outros parâmetros de consulta
    Object.entries(queryParams).forEach(([key, value]) => {
        endpointUrl.searchParams.append(key, value);
    });

    return endpointUrl;
}

// Handler genérico para endpoints da Marvel API
async function handleMarvelRequest(req, res, endpoint) {
    try {
        const url = buildMarvelUrl(endpoint, req.query);
        console.log('Request URL:', url.toString()); // Para depuração
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Erro Marvel API (${response.status}):`, errorBody);
            return res.status(response.status).json({ error: `Marvel API retornou status ${response.status}` });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Endpoints proxy
app.get('/api/characters', (req, res) => handleMarvelRequest(req, res, 'characters'));
app.get('/api/comics', (req, res) => handleMarvelRequest(req, res, 'comics'));
app.get('/api/series', (req, res) => handleMarvelRequest(req, res, 'series'));

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
