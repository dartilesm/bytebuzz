alter table "public"."users" add column "github_url" text;

alter table "public"."users" add column "linkedin_url" text;

alter table "public"."users" add constraint "users_github_url_check" CHECK (((github_url IS NULL) OR (github_url = ''::text) OR (github_url ~ '^https?://(www\.)?github\.com/[a-zA-Z0-9-]+/?$'::text))) not valid;

alter table "public"."users" validate constraint "users_github_url_check";

alter table "public"."users" add constraint "users_linkedin_url_check" CHECK (((linkedin_url IS NULL) OR (linkedin_url = ''::text) OR (linkedin_url ~ '^https?://(www\.)?linkedin\.com/in/[a-zA-Z0-9-]+/?$'::text))) not valid;

alter table "public"."users" validate constraint "users_linkedin_url_check";


