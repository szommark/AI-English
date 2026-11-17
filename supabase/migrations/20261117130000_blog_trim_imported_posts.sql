-- Avalon blog: keep only the posts the site owner chose from tobbmintangol.hu.
--
-- Read on avln.hu: "A klub az új nyelviskola?". Cards that open tobbmintangol.hu for the full
-- text: "Az iskola vége…", "Merre tovább?", "Pénz, idő, energia", "Miért jár kéz a kézben…".
-- Not brought over (they stay on tobbmintangol.hu only): the presentation post and the two
-- London posts, imported by 20261117120100_blog_import_tobbmintangol.sql.

delete from public.blog_posts
where slug in (
  'unalmas-prezentacio-helyett-nagyhatasu-beszed',
  'londoni-parkok-a-hyde-parkon-tul',
  'london-hiv'
);
