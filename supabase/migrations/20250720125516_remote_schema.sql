alter table "public"."users" add column "top_technologies" text[];

alter table "public"."users" add constraint "check_top_technologies_limit" CHECK (((array_length(top_technologies, 1) IS NULL) OR (array_length(top_technologies, 1) <= 3))) not valid;

alter table "public"."users" validate constraint "check_top_technologies_limit";

alter table "public"."users" add constraint "check_top_technologies_unique" CHECK (((top_technologies IS NULL) OR (array_length(top_technologies, 1) = array_length(array_remove(top_technologies, NULL::text), 1)))) not valid;

alter table "public"."users" validate constraint "check_top_technologies_unique";


