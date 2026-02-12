-- Migração para adicionar campos de localização e imagem nas mensagens
-- Execute: psql -U seu_usuario -d seu_banco -f migrate-message-fields.sql

-- Adiciona campos de localização e imagem
ALTER TABLE "Message" 
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "locationLat" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "locationLng" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "locationAddress" TEXT;

-- Comentários para documentação
COMMENT ON COLUMN "Message"."imageUrl" IS 'URL da imagem compartilhada na mensagem';
COMMENT ON COLUMN "Message"."locationLat" IS 'Latitude da localização compartilhada';
COMMENT ON COLUMN "Message"."locationLng" IS 'Longitude da localização compartilhada';
COMMENT ON COLUMN "Message"."locationAddress" IS 'Endereço textual da localização';
