-- AlterTable: Add visibility column and change toolkitIds to toolkitConfigs
ALTER TABLE "Workbench" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'private';
ALTER TABLE "Workbench" ADD COLUMN "toolkitConfigs" JSONB NOT NULL DEFAULT '[]';

-- Migrate existing data: Convert toolkitIds array to toolkitConfigs JSON
UPDATE "Workbench" SET "toolkitConfigs" = (
  SELECT jsonb_agg(jsonb_build_object('id', toolkit_id, 'parameters', '{}'::jsonb))
  FROM unnest("toolkitIds") AS toolkit_id
) WHERE array_length("toolkitIds", 1) > 0;

-- Drop the old toolkitIds column
ALTER TABLE "Workbench" DROP COLUMN "toolkitIds";