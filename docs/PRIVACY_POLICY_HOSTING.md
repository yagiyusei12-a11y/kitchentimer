# プライバシーポリシーを公開する手順

Play Console の「プライバシー ポリシーの URL」には、**誰でもブラウザで開ける HTTPS の URL** が必要です。

## 用意したファイル

`docs/privacy-policy.html`

## 方法A：GitHub Pages（無料・おすすめ）

1. GitHub にリポジトリを作成（例：`kitchen-timer`）
2. `docs/privacy-policy.html` を `docs/index.html` にリネームして push、または `docs/` フォルダごと push
3. リポジトリの **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / folder: **`/docs`**
4. 数分後、次のような URL が使えます：

   `https://<あなたのGitHubユーザー名>.github.io/<リポジトリ名>/`

   `privacy-policy.html` のまま置いた場合：

   `https://<ユーザー名>.github.io/<リポジトリ名>/privacy-policy.html`

## 方法B：Google サイト（無料・コード不要）

1. https://sites.google.com/ で新規サイト作成
2. 本 HTML の本文をコピーしてページに貼り付け
3. 「公開」→ リンクをコピーして Play Console に入力

## 方法C：Netlify Drop（最短）

1. https://app.netlify.com/drop に `docs` フォルダをドラッグ＆ドロップ
2. 表示された `https://xxxx.netlify.app/privacy-policy.html` を Play Console に入力

---

Play Console では、上記 URL を入力して **保存** してください。
