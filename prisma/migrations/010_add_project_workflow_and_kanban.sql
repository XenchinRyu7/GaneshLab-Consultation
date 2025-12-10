-- Add proper project workflow and milestone system
-- Migration: 010_add_project_workflow_and_milestone.sql

-- Create project status enum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'ACTIVE', 'COMPLETED', 'ON_MAINTAIN', 'CANCELLED');

-- Create milestone task status enum
CREATE TYPE "MilestoneTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- Create milestone task priority enum
CREATE TYPE "MilestoneTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Update projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS status "ProjectStatus" DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS pic_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pic_declined_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pic_approval_note TEXT;

-- Update existing projects to use new status
UPDATE projects SET status = 'ACTIVE' WHERE status = 'active';
UPDATE projects SET status = 'COMPLETED' WHERE status = 'completed';
UPDATE projects SET status = 'CANCELLED' WHERE status = 'cancelled';
UPDATE projects SET status = 'PENDING' WHERE status = 'pending';
UPDATE projects SET status = 'ON_MAINTAIN' WHERE status = 'on_hold';

-- Drop old status column constraint and recreate
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'PENDING';

-- Create milestone_tasks table
CREATE TABLE IF NOT EXISTS milestone_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status "MilestoneTaskStatus" DEFAULT 'TODO',
  priority "MilestoneTaskPriority" DEFAULT 'MEDIUM',
  assignee_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES user_profiles(id)
);

-- Create indexes for milestone_tasks
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_project_id ON milestone_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_assignee_id ON milestone_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_status ON milestone_tasks(status);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_priority ON milestone_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_due_date ON milestone_tasks(due_date);

-- Update projects table to make progress calculated (not stored)
-- Progress will be calculated dynamically from milestone tasks
COMMENT ON COLUMN projects.progress IS 'Progress percentage calculated from milestone tasks (0-100)';

-- Add trigger to update project updated_at when milestone tasks change
CREATE OR REPLACE FUNCTION update_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET updated_at = NOW() WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_on_milestone_change
  AFTER INSERT OR UPDATE OR DELETE ON milestone_tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_updated_at();