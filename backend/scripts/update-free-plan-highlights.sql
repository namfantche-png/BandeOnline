-- Atualiza o plano FREE para NÃO permitir destaques
-- Execute este script se o seu banco já existia antes desta alteração:
-- npx prisma db execute --file scripts/update-free-plan-highlights.sql

UPDATE "Plan"
SET "maxHighlights" = 0
WHERE "name" = 'FREE';
