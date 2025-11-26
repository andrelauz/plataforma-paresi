const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Obter formulário público por token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar link do formulário
    const links = await query(
      `SELECT fl.*, a.*, a.id as action_id
       FROM form_links fl
       JOIN actions a ON fl.action_id = a.id
       WHERE fl.token = ? AND fl.is_active = 1`,
      [token]
    );

    if (links.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado ou inativo' });
    }

    const link = links[0];

    // Parse JSON fields
    const formData = {
      token,
      module_id: link.module_id,
      action: {
        id: link.action_id,
        name: link.name,
        goal: link.goal,
        modules: JSON.parse(link.modules || '[]'),
        enabled_questions: JSON.parse(link.enabled_questions || '{}'),
        collection_config: JSON.parse(link.collection_config || '{}')
      }
    };

    res.json(formData);

  } catch (error) {
    console.error('Erro ao buscar formulário:', error);
    res.status(500).json({ error: 'Erro ao buscar formulário' });
  }
});

// Submeter resposta do formulário
router.post('/:token/submit', async (req, res) => {
  try {
    const { token } = req.params;
    const { responses, respondent_email } = req.body;

    // Buscar link do formulário
    const links = await query(
      `SELECT id, action_id, module_id 
       FROM form_links 
       WHERE token = ? AND is_active = 1`,
      [token]
    );

    if (links.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    const formLinkId = links[0].id;

    // Verificar se já existe resposta (para edição)
    let existingResponse = null;
    if (respondent_email) {
      const existing = await query(
        `SELECT id FROM form_responses 
         WHERE form_link_id = ? AND respondent_email = ?`,
        [formLinkId, respondent_email]
      );
      if (existing.length > 0) {
        existingResponse = existing[0];
      }
    }

    // IP e User Agent
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (existingResponse) {
      // Atualizar resposta existente
      await query(
        `UPDATE form_responses 
         SET responses = ?, is_draft = 0, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [JSON.stringify(responses), existingResponse.id]
      );

      res.json({ 
        message: 'Resposta atualizada com sucesso',
        responseId: existingResponse.id 
      });

    } else {
      // Inserir nova resposta
      const result = await query(
        `INSERT INTO form_responses 
         (form_link_id, respondent_email, responses, is_draft, ip_address, user_agent)
         VALUES (?, ?, ?, 0, ?, ?)`,
        [formLinkId, respondent_email || null, JSON.stringify(responses), ip, userAgent]
      );

      res.status(201).json({ 
        message: 'Resposta enviada com sucesso',
        responseId: result.insertId 
      });
    }

  } catch (error) {
    console.error('Erro ao submeter resposta:', error);
    res.status(500).json({ error: 'Erro ao submeter resposta' });
  }
});

// Salvar rascunho
router.post('/:token/draft', async (req, res) => {
  try {
    const { token } = req.params;
    const { responses, respondent_email } = req.body;

    // Buscar link do formulário
    const links = await query(
      `SELECT id FROM form_links 
       WHERE token = ? AND is_active = 1`,
      [token]
    );

    if (links.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    const formLinkId = links[0].id;

    // IP e User Agent
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Verificar se já existe rascunho
    let existingDraft = null;
    if (respondent_email) {
      const existing = await query(
        `SELECT id FROM form_responses 
         WHERE form_link_id = ? AND respondent_email = ? AND is_draft = 1`,
        [formLinkId, respondent_email]
      );
      if (existing.length > 0) {
        existingDraft = existing[0];
      }
    }

    if (existingDraft) {
      // Atualizar rascunho existente
      await query(
        `UPDATE form_responses 
         SET responses = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [JSON.stringify(responses), existingDraft.id]
      );

      res.json({ 
        message: 'Rascunho atualizado',
        draftId: existingDraft.id 
      });

    } else {
      // Criar novo rascunho
      const result = await query(
        `INSERT INTO form_responses 
         (form_link_id, respondent_email, responses, is_draft, ip_address, user_agent)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [formLinkId, respondent_email || null, JSON.stringify(responses), ip, userAgent]
      );

      res.status(201).json({ 
        message: 'Rascunho salvo',
        draftId: result.insertId 
      });
    }

  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
    res.status(500).json({ error: 'Erro ao salvar rascunho' });
  }
});

// Buscar rascunho do respondente
router.get('/:token/draft/:email', async (req, res) => {
  try {
    const { token, email } = req.params;

    // Buscar link do formulário
    const links = await query(
      `SELECT id FROM form_links WHERE token = ?`,
      [token]
    );

    if (links.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    // Buscar rascunho
    const drafts = await query(
      `SELECT responses, updated_at 
       FROM form_responses 
       WHERE form_link_id = ? AND respondent_email = ? AND is_draft = 1
       ORDER BY updated_at DESC LIMIT 1`,
      [links[0].id, email]
    );

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'Rascunho não encontrado' });
    }

    res.json({
      responses: JSON.parse(drafts[0].responses),
      savedAt: drafts[0].updated_at
    });

  } catch (error) {
    console.error('Erro ao buscar rascunho:', error);
    res.status(500).json({ error: 'Erro ao buscar rascunho' });
  }
});

module.exports = router;
