// server.js (ou index.js)

// 1. Carregar as variáveis de ambiente do arquivo .env
// Isso deve ser a primeira coisa a ser feita para garantir que as variáveis estejam disponíveis
require('dotenv').config();

// 2. Importar as bibliotecas necessárias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importe o pacote 'cors'

// 3. Inicializar o aplicativo Express
const app = express();
// A porta será definida pelas variáveis de ambiente do Render, ou 3000 como padrão para desenvolvimento
const port = process.env.PORT || 3000;

// 4. Middlewares (funções que processam as requisições antes que cheguem às rotas)
// Permite que o Express entenda requisições com corpo no formato JSON
app.use(express.json());

// Habilita o CORS (Cross-Origin Resource Sharing). Isso é CRÍTICO para que seu site no GitHub Pages
// (que está em um domínio diferente da sua API no Render) possa fazer requisições para a API.
// Para fins de teste e desenvolvimento, podemos deixar sem restrição por enquanto:
app.use(cors());
// Se quiser restringir, descomente e ajuste a linha abaixo:
// app.use(cors({ origin: 'https://SEU_USUARIO.github.io' })); // Substitua pelo seu domínio real do GitHub Pages


// 5. Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,      // Opções padrão para evitar warnings
        useUnifiedTopology: true    // Opções padrão para evitar warnings
            // As opções useCreateIndex e useFindAndModify foram descontinuadas em versões mais recentes do Mongoose
            })
            .then(() => {
                console.log('Conectado ao MongoDB com sucesso!');
                })
                .catch(err => {
                    console.error('Erro ao conectar ao MongoDB:', err);
                        // Em produção, você pode querer sair do processo se não conseguir conectar ao DB
                            process.exit(1);
                            });

                            // 6. Definir o Schema e o Modelo para os Jogos
                            // O Schema define a estrutura dos documentos (registros) na sua coleção 'games'
                            const gameSchema = new mongoose.Schema({
                                title: { type: String, required: true }, // O título é obrigatório
                                    genre: String,
                                        platform: String,
                                            releaseYear: Number,
                                                imageUrl: String, // URL para uma imagem da capa do jogo
                                                    description: String,
                                                        // Você pode adicionar mais campos conforme a necessidade do seu site
                                                            createdAt: { type: Date, default: Date.now } // Adiciona um timestamp de criação automaticamente
                                                            });

                                                            // O Modelo é o construtor que usamos para interagir com a coleção 'games' no MongoDB
                                                            const Game = mongoose.model('Game', gameSchema);

                                                            // 7. Definir as Rotas (Endpoints) da API

                                                            // Rota de teste simples para verificar se a API está online
                                                            app.get('/', (req, res) => {
                                                                res.send('API de Jogos está online e funcionando!');
                                                                });

                                                                // a) Rota para ADICIONAR um novo jogo (POST)
                                                                app.post('/api/games', async (req, res) => {
                                                                    try {
                                                                            // req.body contém os dados JSON enviados na requisição
                                                                                    const newGame = new Game(req.body);
                                                                                            await newGame.save(); // Salva o novo jogo no MongoDB
                                                                                                    // Responde com o jogo recém-criado e status 201 (Created)
                                                                                                            res.status(201).json(newGame);
                                                                                                                } catch (error) {
                                                                                                                        console.error('Erro ao adicionar jogo:', error);
                                                                                                                                // Responde com erro 400 (Bad Request) se houver problemas de validação ou outros
                                                                                                                                        res.status(400).json({ message: error.message });
                                                                                                                                            }
                                                                                                                                            });

                                                                                                                                            // b) Rota para LISTAR TODOS os jogos (GET)
                                                                                                                                            app.get('/api/games', async (req, res) => {
                                                                                                                                                try {
                                                                                                                                                        const games = await Game.find(); // Busca todos os documentos na coleção 'games'
                                                                                                                                                                res.json(games); // Responde com a lista de jogos em JSON
                                                                                                                                                                    } catch (error) {
                                                                                                                                                                            console.error('Erro ao listar jogos:', error);
                                                                                                                                                                                    res.status(500).json({ message: error.message }); // 500 Internal Server Error
                                                                                                                                                                                        }
                                                                                                                                                                                        });

                                                                                                                                                                                        // c) Rota para OBTER UM JOGO ESPECÍFICO por ID (GET)
                                                                                                                                                                                        app.get('/api/games/:id', async (req, res) => {
                                                                                                                                                                                            try {
                                                                                                                                                                                                    const game = await Game.findById(req.params.id); // Busca um jogo pelo ID fornecido na URL
                                                                                                                                                                                                            if (!game) {
                                                                                                                                                                                                                        return res.status(404).json({ message: 'Jogo não encontrado' }); // 404 Not Found
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                        res.json(game);
                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                    console.error('Erro ao buscar jogo por ID:', error);
                                                                                                                                                                                                                                                            // Captura erros como ID inválido do MongoDB
                                                                                                                                                                                                                                                                    res.status(500).json({ message: 'ID inválido ou erro do servidor.' });
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                        // d) Rota para ATUALIZAR UM JOGO por ID (PUT)
                                                                                                                                                                                                                                                                        app.put('/api/games/:id', async (req, res) => {
                                                                                                                                                                                                                                                                            try {
                                                                                                                                                                                                                                                                                    // Encontra o jogo pelo ID e atualiza com os dados do req.body
                                                                                                                                                                                                                                                                                            // { new: true } retorna o documento atualizado
                                                                                                                                                                                                                                                                                                    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
                                                                                                                                                                                                                                                                                                            if (!updatedGame) {
                                                                                                                                                                                                                                                                                                                        return res.status(404).json({ message: 'Jogo não encontrado para atualização' });
                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                        res.json(updatedGame);
                                                                                                                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                                                                                                                    console.error('Erro ao atualizar jogo:', error);
                                                                                                                                                                                                                                                                                                                                                            res.status(400).json({ message: error.message });
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                                                                // e) Rota para EXCLUIR UM JOGO por ID (DELETE)
                                                                                                                                                                                                                                                                                                                                                                app.delete('/api/games/:id', async (req, res) => {
                                                                                                                                                                                                                                                                                                                                                                    try {
                                                                                                                                                                                                                                                                                                                                                                            const deletedGame = await Game.findByIdAndDelete(req.params.id);
                                                                                                                                                                                                                                                                                                                                                                                    if (!deletedGame) {
                                                                                                                                                                                                                                                                                                                                                                                                return res.status(404).json({ message: 'Jogo não encontrado para exclusão' });
                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                res.json({ message: 'Jogo excluído com sucesso!' });
                                                                                                                                                                                                                                                                                                                                                                                                                    } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                                                            console.error('Erro ao excluir jogo:', error);
                                                                                                                                                                                                                                                                                                                                                                                                                                    res.status(500).json({ message: 'ID inválido ou erro do servidor.' });
                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                                                                                                                                        // 8. Iniciar o servidor
                                                                                                                                                                                                                                                                                                                                                                                                                                        app.listen(port, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                            console.log(`Servidor da API de Jogos rodando em http://localhost:${port}`);
                                                                                                                                                                                                                                                                                                                                                                                                                                                console.log('Use esta URL para testar no Codespaces (se disponível).');
                                                                                                                                                                                                                                                                                                                                                                                                                                                    console.log('Para deploy no Render, ele usará a porta que o Render definir.');
                                                                                                                                                                                                                                                                                                                                                                                                                                                    });