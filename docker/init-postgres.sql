-- Création des bases de données
-- La base principale est déjà créée par POSTGRES_DB (auth_db)

-- Créer la base de données pour Keycloak
CREATE DATABASE keycloak_db;

-- Créer la base de données pour auth-service-node
CREATE DATABASE auth_service_db;

-- Créer la base de données pour quiz-service
CREATE DATABASE quiz_db;

-- Les tables seront créées automatiquement par:
-- - Keycloak pour ses propres tables (dans keycloak_db)
-- - Prisma pour auth-service-node (dans auth_service_db)
-- - Hibernate/JPA pour quiz-service (dans quiz_db)
