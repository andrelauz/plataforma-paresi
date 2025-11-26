-- =====================================================
-- PARESI PLATFORM - Database Schema
-- MariaDB 11.7.2
-- =====================================================

CREATE DATABASE IF NOT EXISTS paresi_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paresi_platform;

-- =====================================================
-- Tabela de Empresas
-- =====================================================
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(100),
    state VARCHAR(2),
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Usuários
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Ações
-- =====================================================
CREATE TABLE actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_audience TEXT,
    duration VARCHAR(100),
    goal TEXT,
    investment DECIMAL(12, 2) DEFAULT 0,
    location VARCHAR(255),
    modules JSON NOT NULL,
    enabled_questions JSON NOT NULL,
    collection_config JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Links de Formulários Públicos
-- =====================================================
CREATE TABLE form_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_id INT NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_action_module (action_id, module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Respostas Individuais (Formulários Públicos)
-- =====================================================
CREATE TABLE form_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_link_id INT NOT NULL,
    respondent_email VARCHAR(255),
    responses JSON NOT NULL,
    is_draft BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_link_id) REFERENCES form_links(id) ON DELETE CASCADE,
    INDEX idx_form_link (form_link_id),
    INDEX idx_email (respondent_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Dados Internos (Preenchimento por Gestores)
-- =====================================================
CREATE TABLE internal_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_id INT NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    responses JSON NOT NULL,
    is_draft BOOLEAN DEFAULT FALSE,
    period_start DATE,
    period_end DATE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_action_module (action_id, module_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Evidências (Arquivos)
-- =====================================================
CREATE TABLE evidences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_id INT NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50),
    response_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action_module (action_id, module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Notificações
-- =====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_id INT,
    module_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('reminder', 'deadline', 'alert', 'info') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Logs de Auditoria
-- =====================================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    changes JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Dados de Exemplo (Opcional - Remover em Produção)
-- =====================================================

-- Empresa de exemplo
INSERT INTO companies (name, email, city, state, contact) VALUES 
('Empresa Demo', 'contato@empresademo.com.br', 'São Paulo', 'SP', '(11) 99999-9999');

-- Usuário admin de exemplo (senha: admin123)
-- Hash gerado com bcrypt rounds=10
INSERT INTO users (company_id, email, password_hash, name, role) VALUES 
(1, 'admin@empresademo.com.br', '$2b$10$rHzJXQJHKvZ4nPKFH8YL0uJvb2MxqKTmH1w5rGw9aJE8fQj5F8tCy', 'Administrador', 'admin');

-- =====================================================
-- Índices Adicionais para Performance
-- =====================================================

-- Índice composto para busca de respostas por período
CREATE INDEX idx_internal_period ON internal_data(action_id, period_start, period_end);

-- Índice para busca de notificações não lidas
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at);

-- Índice para busca de evidências por tipo
CREATE INDEX idx_evidences_type ON evidences(action_id, module_id, file_type);

-- =====================================================
-- Views Úteis
-- =====================================================

-- View: Estatísticas de Respostas por Ação
CREATE VIEW action_response_stats AS
SELECT 
    a.id as action_id,
    a.name as action_name,
    fl.module_id,
    COUNT(DISTINCT fr.id) as total_responses,
    COUNT(DISTINCT CASE WHEN fr.is_draft = 0 THEN fr.id END) as submitted_responses,
    COUNT(DISTINCT CASE WHEN fr.is_draft = 1 THEN fr.id END) as draft_responses
FROM actions a
LEFT JOIN form_links fl ON a.id = fl.action_id
LEFT JOIN form_responses fr ON fl.id = fr.form_link_id
GROUP BY a.id, a.name, fl.module_id;

-- View: Dashboard de Empresa
CREATE VIEW company_dashboard AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT a.id) as total_actions,
    SUM(a.investment) as total_investment,
    COUNT(DISTINCT u.id) as total_users
FROM companies c
LEFT JOIN actions a ON c.id = a.company_id
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.name;

-- =====================================================
-- Procedures Úteis
-- =====================================================

DELIMITER //

-- Procedure: Limpar dados antigos de rascunhos
CREATE PROCEDURE cleanup_old_drafts(IN days_old INT)
BEGIN
    DELETE FROM form_responses 
    WHERE is_draft = TRUE 
    AND updated_at < DATE_SUB(NOW(), INTERVAL days_old DAY);
    
    DELETE FROM internal_data 
    WHERE is_draft = TRUE 
    AND updated_at < DATE_SUB(NOW(), INTERVAL days_old DAY);
END //

-- Procedure: Gerar token único para formulário
CREATE PROCEDURE generate_form_token(
    IN p_action_id INT,
    IN p_module_id VARCHAR(50),
    OUT p_token VARCHAR(100)
)
BEGIN
    DECLARE token_exists INT DEFAULT 1;
    
    WHILE token_exists > 0 DO
        SET p_token = CONCAT(
            LEFT(MD5(RAND()), 6), '-',
            LEFT(MD5(RAND()), 6)
        );
        
        SELECT COUNT(*) INTO token_exists 
        FROM form_links 
        WHERE token = p_token;
    END WHILE;
    
    INSERT INTO form_links (action_id, module_id, token)
    VALUES (p_action_id, p_module_id, p_token);
END //

DELIMITER ;

-- =====================================================
-- Triggers
-- =====================================================

DELIMITER //

-- Trigger: Log de auditoria ao criar ação
CREATE TRIGGER after_action_insert
AFTER INSERT ON actions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, changes)
    VALUES (NULL, 'CREATE', 'action', NEW.id, JSON_OBJECT('name', NEW.name));
END //

-- Trigger: Log de auditoria ao atualizar ação
CREATE TRIGGER after_action_update
AFTER UPDATE ON actions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, changes)
    VALUES (NULL, 'UPDATE', 'action', NEW.id, 
        JSON_OBJECT('old_name', OLD.name, 'new_name', NEW.name));
END //

DELIMITER ;

-- =====================================================
-- Permissões (Ajustar conforme necessário)
-- =====================================================

-- Criar usuário para aplicação
-- CREATE USER 'paresi_app'@'localhost' IDENTIFIED BY 'SUA_SENHA_SEGURA_AQUI';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON paresi_platform.* TO 'paresi_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- Fim do Schema
-- =====================================================
