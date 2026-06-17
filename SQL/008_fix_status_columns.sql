-- Fix missing status columns
ALTER TABLE enterprises ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE semester_enterprises ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
