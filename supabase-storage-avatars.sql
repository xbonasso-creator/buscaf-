-- ══════════════════════════════════════════════════════════
-- BUSCAFÉ — Storage: bucket avatars
-- 1. Primero crear el bucket en Supabase Dashboard:
--    Storage → New bucket → nombre: "avatars" → Public: ON
-- 2. Después correr este SQL en SQL Editor
-- ══════════════════════════════════════════════════════════

-- Usuarios pueden subir/actualizar su propio avatar
create policy "Usuarios suben su avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Usuarios actualizan su avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Avatares públicos para leer"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "Usuarios borran su avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
