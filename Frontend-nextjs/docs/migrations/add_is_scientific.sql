-- Migration: Add is_scientific field to missions table
-- Date: 2025-10-05
-- Description: Adds a boolean field to track if a mission is scientific or regular

-- Add the new column
ALTER TABLE missions 
ADD COLUMN is_scientific BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN missions.is_scientific IS 'Indicates if the mission is scientific (true) or regular (false)';

-- Create index for filtering by mission type (optional, for performance)
CREATE INDEX idx_missions_is_scientific ON missions(is_scientific);

