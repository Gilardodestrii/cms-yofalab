-- YOFALAB: skema database MySQL 8 (utf8mb4, InnoDB)
-- Selaras dengan bagian "Model Data MySQL" pada PRD.

CREATE DATABASE IF NOT EXISTS yofalab
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yofalab;

-- ---------- Pengguna admin ----------
CREATE TABLE users (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120)  NOT NULL,
  email          VARCHAR(190)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  role           ENUM('SUPER_ADMIN','EDITOR','CS') NOT NULL DEFAULT 'EDITOR',
  is_active      TINYINT(1)    NOT NULL DEFAULT 1,
  last_login_at  DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Media ----------
CREATE TABLE media (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_name    VARCHAR(255) NOT NULL,
  path         VARCHAR(500) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  size         INT UNSIGNED NOT NULL,
  width        INT UNSIGNED NULL,
  height       INT UNSIGNED NULL,
  alt_text     VARCHAR(255) NULL,
  uploaded_by  BIGINT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- Produk ----------
CREATE TABLE product_categories (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(190) NOT NULL UNIQUE,
  image_media_id  BIGINT UNSIGNED NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pcat_media FOREIGN KEY (image_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE products (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id        BIGINT UNSIGNED NOT NULL,
  name               VARCHAR(200) NOT NULL,
  slug               VARCHAR(220) NOT NULL UNIQUE,
  short_description  TEXT NULL,
  specifications     JSON NULL,   -- [{"label":"Sample","value":"Whole blood"}, ...]
  applications       JSON NULL,   -- ["Anemia screening", ...]
  brochure_media_id  BIGINT UNSIGNED NULL,
  status             ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  sort_order         INT NOT NULL DEFAULT 0,
  seo_title          VARCHAR(190) NULL,
  seo_description    VARCHAR(320) NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_cat  FOREIGN KEY (category_id)       REFERENCES product_categories(id),
  CONSTRAINT fk_prod_bro  FOREIGN KEY (brochure_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_products_list (status, category_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  BIGINT UNSIGNED NOT NULL,
  media_id    BIGINT UNSIGNED NOT NULL,
  is_primary  TINYINT(1) NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pimg_prod  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pimg_media FOREIGN KEY (media_id)   REFERENCES media(id)
) ENGINE=InnoDB;

CREATE TABLE tags (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE product_tags (
  product_id  BIGINT UNSIGNED NOT NULL,
  tag_id      BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  CONSTRAINT fk_ptag_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_ptag_tag  FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
) ENGINE=InnoDB;

-- Produk terkait manual (opsional; bila kosong, otomatis dari kategori yang sama)
CREATE TABLE product_related (
  product_id          BIGINT UNSIGNED NOT NULL,
  related_product_id  BIGINT UNSIGNED NOT NULL,
  sort_order          INT NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, related_product_id),
  CONSTRAINT fk_prel_a FOREIGN KEY (product_id)         REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_prel_b FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Blog ----------
CREATE TABLE post_categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE posts (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id      BIGINT UNSIGNED NULL,
  author_id        BIGINT UNSIGNED NOT NULL,
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(280) NOT NULL UNIQUE,
  excerpt          TEXT NULL,
  content          LONGTEXT NOT NULL,
  cover_media_id   BIGINT UNSIGNED NULL,
  status           ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  published_at     DATETIME NULL,
  seo_title        VARCHAR(190) NULL,
  seo_description  VARCHAR(320) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_cat    FOREIGN KEY (category_id)    REFERENCES post_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_post_author FOREIGN KEY (author_id)      REFERENCES users(id),
  CONSTRAINT fk_post_cover  FOREIGN KEY (cover_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_posts_list (status, published_at),
  FULLTEXT KEY ft_posts (title, excerpt)
) ENGINE=InnoDB;

CREATE TABLE comments (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id     BIGINT UNSIGNED NOT NULL,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  website     VARCHAR(255) NULL,
  body        TEXT NOT NULL,
  status      ENUM('PENDING','APPROVED','SPAM') NOT NULL DEFAULT 'PENDING',
  ip_hash     CHAR(64) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_comments (post_id, status)
) ENGINE=InnoDB;

-- ---------- Pesan kontak ----------
CREATE TABLE contact_messages (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  subject        VARCHAR(200) NULL,
  message        TEXT NOT NULL,
  status         ENUM('NEW','READ','FOLLOWED_UP') NOT NULL DEFAULT 'NEW',
  internal_note  TEXT NULL,
  ip_hash        CHAR(64) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_messages (status, created_at)
) ENGINE=InnoDB;

-- ---------- Halaman statis dan pengaturan ----------
CREATE TABLE pages (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`       ENUM('HOME','ABOUT') NOT NULL UNIQUE,
  content     JSON NOT NULL,   -- HOME: hero_slides, stats, intro, features; ABOUT: profile, vision, mission, rnd
  updated_by  BIGINT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pages_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE site_settings (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`       VARCHAR(100) NOT NULL UNIQUE,
  value       JSON NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Log aktivitas ----------
CREATE TABLE activity_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NULL,
  action      VARCHAR(40)  NOT NULL,   -- CREATE, UPDATE, DELETE, LOGIN
  entity      VARCHAR(60)  NOT NULL,
  entity_id   BIGINT UNSIGNED NULL,
  meta        JSON NULL,
  ip          VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_logs (entity, entity_id, created_at)
) ENGINE=InnoDB;

-- ---------- Data awal ----------
INSERT INTO product_categories (name, slug, sort_order) VALUES
  ('Blood Grouping Reagent', 'blood-grouping-reagent', 1),
  ('Vacum Blood Collection Series', 'vacum-blood-collection-series', 2),
  ('Hemoglobin Meter', 'hemoglobin-meter', 3);

INSERT INTO post_categories (name, slug) VALUES ('Health', 'health');

INSERT INTO site_settings (`key`, value) VALUES
  ('contact', JSON_OBJECT(
     'address', 'Jl. Amarta No.12 A RT01, RW.01, Pelem, Baturetno, Banguntapan, Bantul Regency, Special Region of Yogyakarta 55198',
     'phone', '(0274) 4436047',
     'whatsapp', '+62 811-255-450',
     'email', 'info@yofalab.com')),
  ('footer', JSON_OBJECT('copyright', 'Copyright © 2026 YOFALAB Indonesia. All rights reserved.'));

-- Akun Super Admin pertama dibuat lewat skrip seed Prisma (kata sandi di-hash), bukan lewat SQL.
