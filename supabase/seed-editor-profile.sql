-- Ejecutar una vez si ya existía tu usuario antes del trigger de profiles:
update public.profiles
set role = 'editor', updated_at = now()
where lower(email) = lower('rai1903fan@gmail.com');

-- Si no hay fila en profiles pero sí en auth.users:
insert into public.profiles (id, email, role)
select id, email, 'editor'
from auth.users
where lower(coalesce(email, '')) = lower('rai1903fan@gmail.com')
on conflict (id) do update set role = 'editor', updated_at = now();
