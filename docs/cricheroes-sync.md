# CricHeroes sync

The repository includes a scheduled sync at `.github/workflows/cricheroes-sync.yml`.
It runs every six hours and can also be started from GitHub Actions with **Run workflow**.

Configure these GitHub repository secrets:

- `SUPABASE_URL`: the project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key; never expose it to the browser
- `TEAM_SETTINGS_ID`: UUID of the single `team_settings` row
- `GITHUB_SYNC_TOKEN`: GitHub token with Actions write access for this repository

Administrators can also start the workflow from the dashboard's **CricHeroes sync** panel.
The token is used only by the protected `trigger-cricheroes-sync` Edge Function and is
never sent to the browser.

The worker uses the public profile URL `12483791/kalinga-warriors` by default. Set
`CRICHEROES_TEAM_URL` in the workflow if the team profile changes.

The worker preserves admin-owned values such as player roles, bios, jersey numbers,
club logo, and ground settings. Apply the migration
`20260912140000_add_cricheroes_sync_metadata.sql` before enabling the workflow.

## Important limitation

`cricheroes` is an unofficial Selenium scraper. CricHeroes can block automation or
change its HTML structure. The job fails without deleting existing Supabase data;
review the Actions log after a failed run. Use an official CricHeroes export/API if
one becomes available.
