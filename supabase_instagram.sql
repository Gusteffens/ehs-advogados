-- Tabela para armazenar as credenciais/token do Instagram
CREATE TABLE IF NOT EXISTS instagram_config (
    id INT PRIMARY KEY DEFAULT 1,
    access_token TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_single_row CHECK (id = 1)
);

-- Inserir a linha inicial padrão com o token placeholder
INSERT INTO instagram_config (id, access_token, updated_at)
VALUES (1, 'PLACEHOLDER_TOKEN', NOW())
ON CONFLICT (id) DO UPDATE 
SET updated_at = NOW(); -- reseta data caso já exista
