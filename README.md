# 飲食店用万能キッチンタイマー

飲食店向けの複数同時カウントダウンキッチンタイマー（React Native / Expo SDK 54）

## プライバシーポリシー（Google Play 用 URL）

GitHub Pages を有効化後、次の URL を Play Console に登録してください。

**https://yagiyusei12-a11y.github.io/kitchentimer/privacy-policy.html**（公開済み・Play Console にこの URL を入力）

Google Play の手順一覧: [docs/PLAY_STORE_SETUP.md](docs/PLAY_STORE_SETUP.md)

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
