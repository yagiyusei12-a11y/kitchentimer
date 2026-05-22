# 飲食店用万能キッチンタイマー

飲食店向けの複数同時カウントダウンキッチンタイマー（React Native / Expo SDK 54）

## プライバシーポリシー（Google Play 用 URL）

GitHub Pages を有効化後、次の URL を Play Console に登録してください。

**https://yagiyusei12-a11y.github.io/kitchentimer/privacy-policy.html**

### GitHub Pages の有効化

1. リポジトリの **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`、フォルダ: **`/docs`**
4. 保存後、数分待って上記 URL にアクセスできることを確認

## 開発

```bash
npm install
npx expo start
```

## Android リリースビルド（AAB）

日本語パスでは Gradle が失敗することがあるため、`kitchen-timer` など ASCII パスで作業してください。

```bash
cd android
./gradlew.bat bundleRelease
```

パッケージ名: `com.restaurant.kitchentimer`
