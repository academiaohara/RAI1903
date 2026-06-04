# Quiniela y rankings (Supabase)

Los rankings **no usan localStorage**: leen participantes y pronósticos de Supabase y calculan puntos en el servidor (`/api/quiniela/ranking`) con los resultados del calendario CMS.

## Tablas

| Tabla | Uso |
|-------|-----|
| `quiniela_predictions` | Pronósticos por usuario, partido y temporada |
| `quiniela_saved_rounds` | Jornadas enviadas (solo quien guardó entra en el ranking) |
| `profiles` | Nombre en la clasificación |
| `cms_season_bundles` | Calendario y crónicas para puntuar |

## Políticas RLS

Ejecuta en el SQL Editor si el ranking sale vacío para usuarios autenticados:

- [`migrations/20250602120000_quiniela_ranking_read.sql`](./migrations/20250602120000_quiniela_ranking_read.sql)

## Variable de servidor (recomendada)

En Vercel / `.env.local` del servidor:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
```

Permite que la API de ranking lea todas las quinielas sin depender de la sesión del visitante. Sin ella, la API usa la sesión autenticada (RLS `authenticated`).

## Flujo

1. Usuario inicia sesión y rellena la quiniela → `quiniela_predictions`.
2. Pulsa **Guardar** → fila en `quiniela_saved_rounds`.
3. Tras el pitido inicial, la API suma puntos con reglas de `lib/quiniela.ts`.
4. **Ranking jornada** (`scope=round`) y **ranking general** (`scope=season`) consumen la misma API.
