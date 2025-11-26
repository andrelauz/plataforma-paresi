const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todas as ações da empresa
router.get('/', async (req, res) => {
  try {
    const actions = await query(
      `SELECT * FROM actions 
       WHERE company_id = ? 
       ORDER BY created_at DESC`,
      [req.user.companyId]
    );

    // Parse JSON fields
    const parsedActions = actions.map(action => ({
      ...action,
      modules: JSON.parse(action.modules || '[]'),
      enabled_questions: JSON.parse(action.enabled_questions || '{}'),
      collection_config: JSON.parse(action.collection_config || '{}')
    }));

    res.json(parsedActions);

  } catch (error) {
    console.error('Erro ao listar ações:', error);
    res.status(500).json({ error: 'Erro ao listar ações' });
  }
});

// Buscar ação específica por ID
router.get('/:id', async (req, res) => {
  try {
    const actions = await query(
      `SELECT * FROM actions 
       WHERE id = ? AND company_id = ?`,
      [req.params.id, req.user.companyId]
    );

    if (actions.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    const action = {
      ...actions[0],
      modules: JSON.parse(actions[0].modules || '[]'),
      enabled_questions: JSON.parse(actions[0].enabled_questions || '{}'),
      collection_config: JSON.parse(actions[0].collection_config || '{}')
    };

    res.json(action);

  } catch (error) {
    console.error('Erro ao buscar ação:', error);
    res.status(500).json({ error: 'Erro ao buscar ação' });
  }
});

// Criar nova ação
router.post('/', async (req, res) => {
  try {
    const {
      name,
      target_audience,
      duration,
      goal,
      investment,
      location,
      modules,
      enabledQuestions,
      collectionConfig
    } = req.body;

    // Validação
    if (!name || !modules || modules.length === 0) {
      return res.status(400).json({ 
        error: 'Nome e pelo menos um módulo são obrigatórios' 
      });
    }

    // Inserir ação
    const result = await query(
      `INSERT INTO actions 
       (company_id, name, target_audience, duration, goal, investment, 
        location, modules, enabled_questions, collection_config)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.companyId,
        name,
        target_audience || null,
        duration || null,
        goal || null,
        investment || 0,
        location || null,
        JSON.stringify(modules),
        JSON.stringify(enabledQuestions || {}),
        JSON.stringify(collectionConfig || {})
      ]
    );

    const actionId = result.insertId;

    // Criar links de formulários para módulos configurados como "individual"
    if (collectionConfig) {
      for (const [moduleId, config] of Object.entries(collectionConfig)) {
        if (config.type === 'individual') {
          const token = generateToken();
          await query(
            `INSERT INTO form_links (action_id, module_id, token)
             VALUES (?, ?, ?)`,
            [actionId, moduleId, token]
          );
        }
      }
    }

    res.status(201).json({
      message: 'Ação criada com sucesso',
      actionId
    });

  } catch (error) {
    console.error('Erro ao criar ação:', error);
    res.status(500).json({ error: 'Erro ao criar ação' });
  }
});

// Atualizar ação
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      target_audience,
      duration,
      goal,
      investment,
      location,
      modules,
      enabledQuestions,
      collectionConfig
    } = req.body;

    // Verificar se ação existe e pertence à empresa
    const existing = await query(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Atualizar
    await query(
      `UPDATE actions 
       SET name = ?, target_audience = ?, duration = ?, goal = ?,
           investment = ?, location = ?, modules = ?,
           enabled_questions = ?, collection_config = ?
       WHERE id = ?`,
      [
        name,
        target_audience,
        duration,
        goal,
        investment,
        location,
        JSON.stringify(modules),
        JSON.stringify(enabledQuestions || {}),
        JSON.stringify(collectionConfig || {}),
        req.params.id
      ]
    );

    res.json({ message: 'Ação atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar ação:', error);
    res.status(500).json({ error: 'Erro ao atualizar ação' });
  }
});

// Deletar ação
router.delete('/:id', async (req, res) => {
  try {
    // Verificar se ação existe e pertence à empresa
    const existing = await query(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Deletar (cascade vai deletar links, respostas, etc)
    await query('DELETE FROM actions WHERE id = ?', [req.params.id]);

    res.json({ message: 'Ação deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar ação:', error);
    res.status(500).json({ error: 'Erro ao deletar ação' });
  }
});

// Obter estatísticas da ação
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await query(
      `SELECT 
        a.id,
        a.name,
        fl.module_id,
        COUNT(DISTINCT fr.id) as total_responses,
        COUNT(DISTINCT CASE WHEN fr.is_draft = 0 THEN fr.id END) as submitted,
        COUNT(DISTINCT CASE WHEN fr.is_draft = 1 THEN fr.id END) as drafts
       FROM actions a
       LEFT JOIN form_links fl ON a.id = fl.action_id
       LEFT JOIN form_responses fr ON fl.id = fr.form_link_id
       WHERE a.id = ? AND a.company_id = ?
       GROUP BY a.id, a.name, fl.module_id`,
      [req.params.id, req.user.companyId]
    );

    res.json(stats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Helper: Gerar token único
function generateToken() {
  return Math.random().toString(36).substring(2, 8) + 
         Math.random().toString(36).substring(2, 8);
}

module.exports = router;
