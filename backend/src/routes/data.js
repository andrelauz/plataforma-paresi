const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar respostas de um formulário
router.get('/responses/:actionId/:moduleId', async (req, res) => {
  try {
    const { actionId, moduleId } = req.params;

    // Verificar se ação pertence à empresa
    const actions = await query(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [actionId, req.user.companyId]
    );

    if (actions.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Buscar respostas
    const responses = await query(
      `SELECT 
        fr.id,
        fr.respondent_email,
        fr.responses,
        fr.is_draft,
        fr.submitted_at,
        fr.updated_at
       FROM form_responses fr
       JOIN form_links fl ON fr.form_link_id = fl.id
       WHERE fl.action_id = ? AND fl.module_id = ?
       ORDER BY fr.submitted_at DESC`,
      [actionId, moduleId]
    );

    // Parse responses JSON
    const parsedResponses = responses.map(r => ({
      ...r,
      responses: JSON.parse(r.responses || '{}')
    }));

    res.json(parsedResponses);

  } catch (error) {
    console.error('Erro ao listar respostas:', error);
    res.status(500).json({ error: 'Erro ao listar respostas' });
  }
});

// Salvar dados internos
router.post('/internal/:actionId/:moduleId', async (req, res) => {
  try {
    const { actionId, moduleId } = req.params;
    const { responses, isDraft, periodStart, periodEnd } = req.body;

    // Verificar se ação pertence à empresa
    const actions = await query(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [actionId, req.user.companyId]
    );

    if (actions.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Inserir ou atualizar dados
    const result = await query(
      `INSERT INTO internal_data 
       (action_id, module_id, user_id, responses, is_draft, period_start, period_end)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        actionId,
        moduleId,
        req.user.userId,
        JSON.stringify(responses),
        isDraft ? 1 : 0,
        periodStart || null,
        periodEnd || null
      ]
    );

    res.status(201).json({
      message: isDraft ? 'Rascunho salvo' : 'Dados salvos com sucesso',
      dataId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao salvar dados internos:', error);
    res.status(500).json({ error: 'Erro ao salvar dados internos' });
  }
});

// Obter dados internos
router.get('/internal/:actionId/:moduleId', async (req, res) => {
  try {
    const { actionId, moduleId } = req.params;

    // Verificar se ação pertence à empresa
    const actions = await query(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [actionId, req.user.companyId]
    );

    if (actions.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Buscar dados internos
    const data = await query(
      `SELECT 
        id.*,
        u.name as user_name,
        u.email as user_email
       FROM internal_data id
       JOIN users u ON id.user_id = u.id
       WHERE id.action_id = ? AND id.module_id = ?
       ORDER BY id.submitted_at DESC`,
      [actionId, moduleId]
    );

    // Parse responses JSON
    const parsedData = data.map(d => ({
      ...d,
      responses: JSON.parse(d.responses || '{}')
    }));

    res.json(parsedData);

  } catch (error) {
    console.error('Erro ao buscar dados internos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados internos' });
  }
});

// Atualizar dados internos
router.put('/internal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { responses, isDraft } = req.body;

    // Verificar se dados pertencem à empresa do usuário
    const existing = await query(
      `SELECT id.id 
       FROM internal_data id
       JOIN actions a ON id.action_id = a.id
       WHERE id.id = ? AND a.company_id = ?`,
      [id, req.user.companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Dados não encontrados' });
    }

    // Atualizar
    await query(
      `UPDATE internal_data 
       SET responses = ?, is_draft = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [JSON.stringify(responses), isDraft ? 1 : 0, id]
    );

    res.json({ message: 'Dados atualizados com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados' });
  }
});

// Deletar dados internos
router.delete('/internal/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se dados pertencem à empresa do usuário
    const existing = await query(
      `SELECT id.id 
       FROM internal_data id
       JOIN actions a ON id.action_id = a.id
       WHERE id.id = ? AND a.company_id = ?`,
      [id, req.user.companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Dados não encontrados' });
    }

    // Deletar
    await query('DELETE FROM internal_data WHERE id = ?', [id]);

    res.json({ message: 'Dados deletados com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar dados:', error);
    res.status(500).json({ error: 'Erro ao deletar dados' });
  }
});

// Obter link de formulário para módulo
router.get('/form-link/:actionId/:moduleId', async (req, res) => {
  try {
    const { actionId, moduleId } = req.params;

    // Verificar se ação pertence à empresa
    const actions = await query(
      'SELECT id FROM actions WHERE id = ? AND company_id = ?',
      [actionId, req.user.companyId]
    );

    if (actions.length === 0) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Buscar link
    const links = await query(
      `SELECT token, is_active, created_at 
       FROM form_links 
       WHERE action_id = ? AND module_id = ?`,
      [actionId, moduleId]
    );

    if (links.length === 0) {
      return res.status(404).json({ error: 'Link de formulário não encontrado' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const fullLink = `${baseUrl}/f/${links[0].token}`;

    res.json({
      token: links[0].token,
      fullLink,
      isActive: links[0].is_active,
      createdAt: links[0].created_at
    });

  } catch (error) {
    console.error('Erro ao buscar link:', error);
    res.status(500).json({ error: 'Erro ao buscar link' });
  }
});

module.exports = router;
