# n8n Shopee Affiliate Automation

Workflow tự động hóa quy trình **nhận link Shopee → xử lý nội dung bằng Gemini → đăng Facebook** bằng n8n và không sử dụng API của Shopee Affilate.

## 🚀 Workflow

```text
Shopee Affiliate Link
        │
        ▼
      n8n
        │
        ├── Xử lý / kiểm tra link
        │
        ▼
   Đăng bài
        │
        ▼
 Facebook Page
```

## 📌 Chức năng

* Nhập link Shopee.
* Xử lý và kiểm tra link sản phẩm.
* Chuẩn bị nội dung bài đăng.
* Hỗ trợ lên lịch đăng bài.
* Tự động đăng bài lên Facebook Page.
* Có thể mở rộng để xử lý nhiều sản phẩm.
* Workflow được xây dựng và chạy trên n8n.

## 🛠️ Công nghệ

* [n8n](https://n8n.io/)
* Facebook Graph API
* nodejs
* Gemini

## 📂 Cấu trúc thư mục

```text
.
├── workflows/
│   └── shopee-affiliate-facebook.json
├── README.md
├── README_en.md
└── .gitignore
```

## ⚙️ Cài đặt

### 1. Cài đặt n8n

Có thể chạy n8n bằng Docker:

```bash
docker compose up -d
```

Sau khi chạy, truy cập:

```text
http://localhost:5678
```

### 2. Import workflow

Trong n8n:

```text
Workflows
    ↓
Import from File
    ↓
Chọn file .json
```

Sau khi import, cần cấu hình lại các Credentials tương ứng.

### 3.Chạy Chrome với Remote Debugging
Tắt hết Chrome bằng cách mở PowerShell
```text
taskkill /F /IM chrome.exe
``` 
Tạo folder chứa profile chrome
Mở Chrome với port 9222
```text
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="D:\chrome-profile"
```
Kiểm tra port
```
http://127.0.0.1:9222/json/version
```
Nếu thành công kết quả hiển thị dạng
```
{
  "Browser": "Chrome/154....",
  "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/..."
}
```
### 4. Cấu hình Credentials

Workflow có thể sử dụng các credentials như:
* Gemini API
* Facebook
* Các API khác nếu được bổ sung

**Credentials không được lưu trực tiếp trong repository.**

Sau khi import workflow, tạo lại credentials trong:

```text
n8n
→ Credentials
```

và gán credentials tương ứng cho các node.

## 🔐 Bảo mật

Không commit các thông tin nhạy cảm lên GitHub:

Trước khi commit workflow, nên kiểm tra file JSON để đảm bảo không có secret được hard-code trong node.

Ví dụ **không nên**:

```json
{
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}
```

Nên sử dụng **n8n Credentials** hoặc biến môi trường thay vì hard-code secret.

## 🔄 Cập nhật workflow

Sau khi chỉnh sửa workflow:

```bash
git add .
git commit -m "Update Shopee affiliate workflow"
git push
```

Ví dụ:

```bash
git add workflows/shopee-affiliate-facebook.json
git commit -m "Update Facebook scheduling"
git push
```

## 📋 Import lại workflow

Khi cần khôi phục workflow:

```text
GitHub
   ↓
Download .json
   ↓
n8n
   ↓
Import from File
   ↓
Configure Credentials
   ↓
Activate
```

## ⚠️ Lưu ý

Workflow này yêu cầu người dùng tự cấu hình:

* Telegram Bot
* Shopee Affiliate API
* Facebook Page / Facebook Graph API
* Các credential liên quan

Các credential **không được cung cấp trong repository**.

