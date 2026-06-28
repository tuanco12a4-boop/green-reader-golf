# Firebase setup cho app Hình học 2D

Mục tiêu: người dùng đăng nhập bằng email, còn Gemini API key nằm trong Cloud Functions. Frontend không cần và không thấy API key.

## 1. Tạo Firebase project

1. Vào Firebase Console, tạo project mới.
2. Bật **Authentication** -> **Sign-in method** -> **Email/Password**.
3. Vào **Project settings** -> **Your apps** -> tạo Web app.
4. Copy Firebase web config.

## 2. Điền config frontend

Mở `geometry-2d/config.js` và thay các giá trị `PASTE_...`:

```js
window.GEOMETRY_AI_CONFIG = {
  firebase: {
    apiKey: "...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    appId: "..."
  },
  functionsUrl: "https://asia-southeast1-your-project.cloudfunctions.net/geometryAi",
  allowDemoFallback: true
};
```

## 3. Deploy Cloud Function

```powershell
npm install -g firebase-tools
firebase login
copy .firebaserc.example .firebaserc
```

Sửa `.firebaserc` thành project id thật, rồi chạy:

```powershell
cd functions
npm install
cd ..
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions
```

## 4. Giới hạn email được dùng AI

Nếu muốn chỉ vài email được dùng AI, tạo file `functions/.env` trên máy deploy:

```env
ALLOWED_EMAILS=a@school.edu,b@school.edu
```

File `.env` không commit lên GitHub. Nếu bỏ trống `ALLOWED_EMAILS`, mọi tài khoản đã đăng nhập đều dùng được AI.

## 5. Deploy lại GitHub Pages

Sau khi `config.js` đã có project thật, commit và push lên GitHub. Người dùng mở link GitHub Pages, tạo tài khoản/đăng nhập email, rồi dùng AI mà không cần nhập API key.
