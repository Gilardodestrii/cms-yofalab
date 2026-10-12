-- Index FULLTEXT untuk pencarian blog.
-- Tidak dapat dinyatakan di prisma/schema.prisma, jadi ditambahkan sebagai
-- migrasi terpisah agar database sesuai dengan `docs/schema.sql` (ft_posts).
CREATE FULLTEXT INDEX `ft_posts` ON `posts`(`title`, `excerpt`, `content`) VISIBLE;