# Запуск сайта LEO Barbershop

Готовый сайт лежит в папке `dist/` (или архив `leo-barbershop-site.zip`). Сервер и база данных не нужны.

## Запуск через GitHub Pages (уже подготовлено)
Сайт собран в папку `docs/` в ветке `claude/confident-bell-5dmw1t`.
1. GitHub → репозиторий → Settings → Pages.
2. Source: **Deploy from a branch** → Branch: `claude/confident-bell-5dmw1t`, папка `/docs` → Save.
3. Через 1–2 минуты сайт откроется: https://danub2004-dot.github.io/Daniel/
4. Свой домен: в том же разделе Custom domain → `leobarbershop.md`, у регистратора добавить записи A на
   185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (или CNAME `www` → danub2004-dot.github.io).

## Другой способ: Netlify (бесплатно, ~2 минуты)
1. Откройте https://app.netlify.com/drop
2. Перетащите туда папку `dist` (или распакованный архив).
3. Сайт сразу заработает по адресу вида `xxx.netlify.app`.
4. Подключите домен: Site configuration → Domain management → Add domain → `leobarbershop.md`,
   затем у регистратора домена укажите DNS-записи, которые покажет Netlify.

Альтернативы: Cloudflare Pages, Vercel, или текущий хостинг leobarbershop.md — просто загрузите содержимое `dist/` в корень сайта.

## После запуска (SEO)
1. Google Search Console → добавить `https://leobarbershop.md/` → отправить `sitemap.xml`.
2. Google Business Profile (Google Карты) — заполнить и указать ссылку на сайт. Это главное для поиска «barbershop Chișinău».
3. Проверить разметку: https://search.google.com/test/rich-results

## Изменения
Правки делаются в `index.html`, затем пересобрать: `node build.mjs` → обновится `dist/`.
Если домен будет другой — замените `https://leobarbershop.md/` в `index.html`, `sitemap.xml`, `robots.txt`.
