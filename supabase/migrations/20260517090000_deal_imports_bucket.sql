-- Private bucket holding raw .xlsx offer workbooks queued for automated
-- import by the `import-deal` edge function. Accessed only via the service
-- role (the import pipeline), so no public policies are needed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('deal-imports', 'deal-imports', false)
ON CONFLICT (id) DO NOTHING;
