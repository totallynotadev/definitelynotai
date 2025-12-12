-- Add new enums for agent tracking
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."artifact_type" AS ENUM('plan', 'code', 'config', 'docs');--> statement-breakpoint

-- Enhance agent_logs with model tracking columns
ALTER TABLE "agent_logs"
ADD COLUMN IF NOT EXISTS "agent_id" TEXT,
ADD COLUMN IF NOT EXISTS "model_used" TEXT,
ADD COLUMN IF NOT EXISTS "input_tokens" INTEGER,
ADD COLUMN IF NOT EXISTS "output_tokens" INTEGER,
ADD COLUMN IF NOT EXISTS "duration_ms" INTEGER,
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'success';--> statement-breakpoint

-- Add plan column to projects
ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "plan" JSONB;--> statement-breakpoint

-- Create council_decisions table for multi-model voting
CREATE TABLE IF NOT EXISTS "council_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"action_id" text NOT NULL,
	"action" text NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"approved" boolean NOT NULL,
	"requires_human" boolean DEFAULT false,
	"reasoning" text,
	"votes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Create artifacts table for generated code and documents
CREATE TABLE IF NOT EXISTS "artifacts" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"type" "artifact_type" NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"version" integer DEFAULT 1,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "council_decisions" ADD CONSTRAINT "council_decisions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Create indexes for agent_logs
CREATE INDEX IF NOT EXISTS "agent_logs_agent_id_idx" ON "agent_logs" USING btree ("agent_id");--> statement-breakpoint

-- Create indexes for council_decisions
CREATE INDEX IF NOT EXISTS "council_decisions_project_id_idx" ON "council_decisions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "council_decisions_action_id_idx" ON "council_decisions" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "council_decisions_created_at_idx" ON "council_decisions" USING btree ("created_at");--> statement-breakpoint

-- Create indexes for artifacts
CREATE INDEX IF NOT EXISTS "artifacts_project_id_idx" ON "artifacts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artifacts_type_idx" ON "artifacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artifacts_created_at_idx" ON "artifacts" USING btree ("created_at");
