-- Noticias del CMS sin vínculo a temporadas (cms_seasons sigue para plantillas, etc.)
alter table public.cms_news_items
  drop constraint if exists cms_news_items_season_id_fkey;

alter table public.cms_news_items
  drop column if exists season_id;
