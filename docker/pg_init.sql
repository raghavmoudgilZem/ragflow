CREATE TABLE "conversations" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"dialog_id" varchar(32) NOT NULL,
	"name" varchar(255),
	"user_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "dialogs" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"description" text,
	"icon" text,
	"language" varchar(32) DEFAULT 'English',
	"llm_id" varchar(128),
	"llm_setting" jsonb,
	"prompt_type" varchar(16) DEFAULT 'simple',
	"prompt_config" jsonb,
	"meta_data_filter" jsonb DEFAULT '{}'::jsonb,
	"similarity_threshold" real DEFAULT 0.2,
	"vector_similarity_weight" real DEFAULT 0.3,
	"top_n" integer DEFAULT 6,
	"top_k" integer DEFAULT 1024,
	"do_refer" varchar(1) DEFAULT '1',
	"rerank_id" varchar(128),
	"kb_ids" varchar(32)[] DEFAULT '{}'::varchar[],
	"status" varchar(1) DEFAULT '1',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"conversation_id" varchar(32) NOT NULL,
	"parent_id" varchar(32),
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"llm_id" varchar(128),
	"reference" jsonb DEFAULT '[]'::jsonb,
	"thumbup" boolean,
	"feedback" text,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_dialog_id_dialogs_id_fk" FOREIGN KEY ("dialog_id") REFERENCES "public"."dialogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversation_dialog_id" ON "conversations" USING btree ("dialog_id");--> statement-breakpoint
CREATE INDEX "idx_message_conversation_id" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_message_pagination" ON "messages" USING btree ("conversation_id","created_at" DESC NULLS LAST);