import express from 'express';
import cors from 'cors';
import { registerChatRoutes, registerConversationRoutes } from './chat-services/handler.js';
import { registerDatasetRoutes } from './dataset-services/handler.js';
import { registerIdentityRoutes } from './identity-services/handler.js';
import { registerChunkRoutes } from './chunk-services/handler.js';
import { registerTenantRoutes } from './identity-services/handler.js';
import { initializeDatabase } from './db.js';
import { registerAdminRoutes } from './admin-services/handler.js';

const app = express();
const PORT = 4000;
const router = express.Router();

app.use(cors());
app.use(express.json());

initializeDatabase();

registerChatRoutes(router);
registerConversationRoutes(router);
registerDatasetRoutes(router);
registerIdentityRoutes(router);
registerChunkRoutes(router);
registerTenantRoutes(router);
registerAdminRoutes(router);
app.use('/api/v1', router);

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        server: 'ragflow-mock-server',
    });
});

app.listen(PORT, () => {
    console.log(`RAGFlow Mock Server running at http://localhost:${PORT}`);
});