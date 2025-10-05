-- Migration: Add module_config_id field to modules table
-- Date: 2025-10-05
-- Description: Adds a field to track which module configuration from arkha_modules.json is used

-- Add the new column
ALTER TABLE modules 
ADD COLUMN module_config_id TEXT NOT NULL DEFAULT '';

-- Add comment to document the field
COMMENT ON COLUMN modules.module_config_id IS 'ID of the module configuration from arkha_modules.json';

-- Create index for filtering by module config (optional, for performance)
CREATE INDEX idx_modules_config_id ON modules(module_config_id);

