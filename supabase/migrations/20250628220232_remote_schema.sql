create policy "Give public access to post-images"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'post-images'::text));


create policy "Give users access to own folder"
on "storage"."objects"
as permissive
for all
to authenticated
using (((bucket_id = 'post-images'::text) AND ((storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text))))
with check (((bucket_id = 'post-images'::text) AND ((storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text))));



