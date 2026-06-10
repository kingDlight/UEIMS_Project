-- Migration: Add missing updated_at column to permissions table
-- This fixes Hibernate mapping for Permission which extends BaseEntity.

ALTER TABLE permissions
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
