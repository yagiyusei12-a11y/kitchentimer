# Google Play 公開チェックリスト

## 完了済み（自動設定）

| 項目 | 内容 |
|------|------|
| ソースコード | https://github.com/yagiyusei12-a11y/kitchentimer |
| パッケージ名 | `com.restaurant.kitchentimer` |
| AAB（ローカル） | `release/kitchen-timer-1.0.0.aab`（要ローカルビルド時は `android/gradlew.bat bundleRelease`） |
| プライバシーポリシー URL | **https://yagiyusei12-a11y.github.io/kitchentimer/privacy-policy.html** |
| GitHub Pages | 有効（`/docs` から公開） |

---

## Play Console で入力する値（コピー用）

### アプリ作成時
- **アプリ名:** 飲食店用万能キッチンタイマー
- **パッケージ名:** `com.restaurant.kitchentimer`
- **言語:** 日本語 - ja-JP
- **種類:** アプリ / 無料

### プライバシー ポリシー
```
https://yagiyusei12-a11y.github.io/kitchentimer/privacy-policy.html
```

### リリース（AAB アップロード）
ローカルファイル:
```
c:\Users\info\app\kitchen-timer\release\kitchen-timer-1.0.0.aab
```
※無い場合は `kitchen-timer\android` で `gradlew.bat bundleRelease` 後、
`android\app\build\outputs\bundle\release\app-release.aab` を使用

---

## 手動で残る作業（Play Console のみ）

1. **ストアの掲載情報** … 短い説明・詳しい説明・スクリーンショット（実機で2〜8枚）
2. **アプリのカテゴリ** … 例: 仕事効率化 / フード＆ドリンク
3. **コンテンツのレーティング** … アンケート回答
4. **ターゲット層** … 主に成人向け
5. **データの安全性** … 収集なし／端末内のみと回答
6. **内部テスト** または **製品版** に AAB をアップロードして審査提出

---

## 署名キー（更新・再ビルド時）

- `android/app/kitchen-timer-release.keystore`（Git には含めていません）
- 詳細はローカルの `release/PLAY_STORE_README.txt`（存在する場合）

---

## 開発・再ビルド

```powershell
cd c:\Users\info\app\kitchen-timer
npm install
npx expo start
```

```powershell
cd c:\Users\info\app\kitchen-timer\android
.\gradlew.bat bundleRelease
```
