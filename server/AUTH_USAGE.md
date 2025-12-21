# Hướng Dẫn Sử Dụng & Kiểm Tra API Auth

Tài liệu này hướng dẫn cách sử dụng và kiểm tra các tính năng Authentication đã được triển khai, bao gồm Đăng nhập (Email/Google) và Quên mật khẩu.

## 1. Môi Trường Setup
- **Server**: Django đang chạy tại `http://127.0.0.1:8000`
- **Email**: Đang ở chế độ Console (in ra terminal), không gửi email thật.

---

## 2. API Endpoints

### A. Đăng Nhập (Login)
Dành cho User thường hoặc Admin đã có tài khoản.

- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "email": "user@example.com",
      "password": "your_password"
  }
  ```
- **Response**: Trả về `access` và `refresh` token.

### B. Google Login
Dành cho user đăng nhập bằng Google Gmail.

- **URL**: `/api/auth/google/`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "id_token": "GOOGLE_ID_TOKEN_RECEIVED_FROM_FRONTEND"
  }
  ```

---

## 3. Quy Trình Reset Password (Quên Mật Khẩu)

### Bước 1: Gửi yêu cầu Reset
Khi người dùng quên mật khẩu, gọi API này để hệ thống gửi email.

- **URL**: `/api/auth/password-reset/`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "email": "user@example.com"
  }
  ```

**Cách lấy Link Reset (Môi trường Dev):**
1. Nhìn vào **Terminal** đang chạy server.
2. Tìm đoạn log bắt đầu bằng `Subject: Password Reset Request...`.
3. Copy đường link có dạng: 
   `http://localhost:3000/auth/reset-password?uid=...&token=...`
4. Trích xuất **uid** và **token** từ link đó.

### Bước 2: Xác nhận & Đổi mật khẩu
Frontend sẽ lấy uid, token từ URL và cho người dùng nhập mật khẩu mới.

- **URL**: `/api/auth/password-reset-confirm/`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "uid": "UID_FROM_EMAIL_LINK",
      "token": "TOKEN_FROM_EMAIL_LINK",
      "new_password": "new_secure_password_123"
  }
  ```

---

## 4. Ví Dụ Cụ Thể (cURL)

**1. Tạo User test (Terminal):**
```bash
python manage.py createsuperuser
# Email: test@example.com / Pass: 123
```

**2. Quên mật khẩu:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/password-reset/ \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
```

**3. Đổi mật khẩu mới:**
*(Thay UID, TOKEN bạn nhận được vào bên dưới)*
```bash
curl -X POST http://127.0.0.1:8000/api/auth/password-reset-confirm/ \
     -H "Content-Type: application/json" \
     -d '{
           "uid": "MjA", 
           "token": "xxxxx-yyyyy-zzzzz", 
           "new_password": "new_password_vip_pro"
         }'
```

**4. Đăng nhập lại:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "new_password_vip_pro"}'
```
