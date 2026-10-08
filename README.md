# 🎙️ Discord Voicechat Auto Join

Discord User Account Auto Join สำหรับบอทห้องเสียง 24/7 · เปิดหลายบัญชีพร้อมกัน · Re-Connect อัตโนมัติเมื่อหลุด · ปรับแต่ง Mute / Deaf ได้ง่าย

Made for **Discord Voicechat Automation**

---

## ✨ คุณสมบัติเด่น (Features)

- 🔄 **Auto Reconnect 24/7**: เชื่อมต่อใหม่ให้อัตโนมัติทันทีหากการเชื่อมต่อหลุดหรืออินเทอร์เน็ตมีปัญหา
- 👥 **Multi-Account & Multi-Channel**: รองรับการใช้งานหลายบัญชี (Tokens) และหลายห้องเสียง (Channel IDs) พร้อมกัน
- 🔇 **Self Mute & Deaf Control**: ตั้งค่าปิดไมค์ (`SELF_MUTE`) และปิดเสียงหูฟัง (`SELF_DEAF`) ได้ตามต้องการ
- ⚡ **PM2 & Windows Batch Ready**: รองรับการรันผ่านไฟล์ `.bat` ดับเบิลคลิกเปิดได้ทันที หรือรันเบื้องหลังผ่าน PM2
- 📁 **Modular Clean Code**: แยกซอร์สโค้ดออกเป็นสัดส่วน (`src/config.js`, `src/voice.js`, `src/index.js`) ดูแลรักษาง่าย

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── src/
│   ├── config.js          # จัดการค่ากำหนดและการโหลด Environment Variables
│   ├── voice.js           # ระบบจัดการ Voice Connection และการเชื่อมต่อใหม่
│   └── index.js           # Entry point หลักสำหรับเริ่มต้นทำงานทุก Session
├── .env.example           # ตัวอย่างไฟล์ตั้งค่า Environment Variables
├── .gitignore             # กำหนดไฟล์ที่ไม่ต้องส่งเข้า Git
├── ecosystem.config.js     # ไฟล์ตั้งค่าสำหรับรัน PM2
├── package.json           # การระบุ Dependencies และ Scripts
├── README.md              # เอกสารอธิบายโปรเจกต์
└── start.bat              # สคริปต์เปิดใช้งานรวดเร็วสำหรับ Windows
```

---

## 📌 วิธีการตั้งค่าก่อนใช้งาน (Configuration)

1. คัดลอกไฟล์ `.env.example` แล้วเปลี่ยนชื่อเป็น `.env`:
   ```bash
   cp .env.example .env
   ```

2. แก้ไขข้อมูลในไฟล์ `.env`:
   ```env
   # Discord Token (หากมีหลายไอดี ให้คั่นด้วยเครื่องหมายจุลภาค ,)
   TOKEN=YOUR_DISCORD_TOKEN_1,YOUR_DISCORD_TOKEN_2

   # Voice Channel ID (หากมีหลายห้อง ให้คั่นด้วยเครื่องหมายจุลภาค ,)
   CHANNEL_ID=123456789012345678,987654321098765432

   # การตั้งค่าเปิด/ปิดไมค์และหูฟัง (true / false)
   SELF_DEAF=true
   SELF_MUTE=true
   ```

---

## ⚙️ รายละเอียดตัวแปรสภาพแวดล้อม (Environment Variables)

| ตัวแปร | คำอธิบาย | ตัวอย่างค่า | Required |
| :--- | :--- | :--- | :---: |
| `TOKEN` / `TOKENS` | Discord User Token (ใส่ได้หลายค่าคั่นด้วย `,`) | `MTMy...` | ✅ |
| `CHANNEL_ID` / `CHANNEL_IDS` | ID ของห้องเสียง Discord (ใส่ได้หลายค่าคั่นด้วย `,`) | `123456789012345678` | ✅ |
| `SELF_DEAF` | ปิดเสียงหูฟังอัตโนมัติเมื่อเข้าห้อง | `true` / `false` (Default: `true`) | ❌ |
| `SELF_MUTE` | ปิดไมโครโฟนอัตโนมัติเมื่อเข้าห้อง | `true` / `false` (Default: `true`) | ❌ |

---

## 🚀 วิธีการเปิดใช้งาน (Getting Started)

### ติดตั้ง Dependencies
```bash
npm install
```

### วิธีที่ 1: ดับเบิลคลิกไฟล์ `.bat` (สำหรับ Windows)
- ดับเบิลคลิกไฟล์ **`start.bat`** เพื่อเปิดใช้งานได้ทันที

### วิธีที่ 2: รันผ่าน Node.js Command Line
```bash
npm start
```

### วิธีที่ 3: รันเบื้องหลังตลอด 24 ชั่วโมงด้วย PM2
```bash
# ติดตั้ง PM2 (หากยังไม่ได้ติดตั้ง)
npm install -g pm2

# เริ่มการทำงานผ่าน PM2
pm2 start ecosystem.config.js

# ตรวจสอบสถานะการทำงาน
pm2 status

# ดู Logs การทำงานแบบ Real-time
pm2 logs discord-voicechat
```

---

## 📄 License & Credits

Distributed under the MIT License. See `LICENSE` for more information.
