# 📝 Task Manager (Interview App)

> Professional-grade Personal Task Management System ออกแบบมาเพื่อประสิทธิภาพสูงสุดในการจัดการงานส่วนตัว พร้อมระบบวิเคราะห์ข้อมูล (Insights) แบบ Real-time และโครงสร้างที่รองรับการขยายตัว (Server-side Scalability)

🔗 **Live Demo:** [https://interview-blond-nine.vercel.app](https://interview-blond-nine.vercel.app)

---

## 🚀 Project Overview

โปรเจกต์นี้ถูกพัฒนาขึ้นเพื่อเป็นเครื่องมือจัดการงานที่มีมาตรฐานระดับ Enterprise โดยเน้นไปที่ User Experience (UX) ที่ลื่นไหล และการจัดการข้อมูลปริมาณมากอย่างมีประสิทธิภาพผ่านระบบ Server-side แทนการประมวลผลที่ฝั่ง Client เพียงอย่างเดียว

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL, Real-time Subscriptions) |
| Data Visualization | Recharts (Responsive Charts) |
| UI/UX Components | Sonner (Toast Notifications), Lucide React (Icons) |
| Security | Row Level Security (RLS), Supabase Auth |

---

## ✨ Key Features

- 🔄 **Real-time Sync:** ข้อมูลซิงค์ตรงกันทันทีในทุก Session ผ่าน Supabase Real-time
- 📊 **Advanced Insights:** กราฟวิเคราะห์ภาระงานรายสัปดาห์ (Weekly Workload) และแนวโน้มงานที่ทำเสร็จ (Completion Trends)
- ⚡ **Server-side Scalability:** ระบบ Search (Debounced), Filtering (Status & Priority), และ Pagination ทำงานที่ฝั่ง Server ทั้งหมด เพื่อรองรับข้อมูลจำนวนมหาศาล
- 🎯 **Priority System:** แบ่งระดับความสำคัญ (High, Medium, Low) พร้อม Visual Cue (แถบสี) เพื่อการตัดสินใจที่รวดเร็ว
- 🛠 **Professional UX Patterns:**
  - **Bulk Actions:** เลือกจัดการงานหลายรายการพร้อมกัน (Mark as done / Delete)
  - **Intuitive Interactions:** คลิกที่แถว (Row) เพื่อเลือกงาน, ระบบ Click-outside เพื่อปิด Modal
  - **Native Date Picker:** ปรับแต่ง Input ให้เรียกใช้ `showPicker` API เพื่อความสะดวกในการกรอกวันที่

---

## 🤖 AI Integration (Collaborative Development)

โปรเจกต์นี้เป็นตัวอย่างของการทำงานร่วมกันระหว่าง Human Expertise และ AI Capabilities อย่างมีประสิทธิภาพ:

- **Cursor & Claude/Gemini:** ใช้ในการทำ Rapid Prototyping, ออกแบบ SQL Schema ที่ซับซ้อน และการ Refactor Code ตามหลัก Clean Code & Best Practices
- **Gemini (UX Design Partner):** ทำหน้าที่เป็นที่ปรึกษาด้าน UI/UX ในการวาง Layout, แก้ไขปัญหา Visual Contrast และเสนอแนะ Professional UX Patterns เช่น การทำ Backdrop click dismissal และระบบ Pagination ที่เหมาะสม
- **AI-Driven Documentation:** การใช้ AI ช่วยขัดเกลาเอกสาร (README) และ SQL Migrations ให้มีความแม่นยำและเป็นมาตรฐานสากล

---

## 🛡️ Best Practices & Architecture

- **Clean Code:** ยึดหลักการเขียนโค้ดที่อ่านง่าย แยกคอมโพเนนต์ชัดเจน (Modular Design) และง่ายต่อการบำรุงรักษา
- **Security First:** มั่นใจในความปลอดภัยของข้อมูลด้วย Row Level Security (RLS) ของ Supabase — ข้อมูลใครข้อมูลมัน (Data Isolation)
- **Performance Optimized:** ลดภาระของ Browser ด้วยการทำ Server-side Logic สำหรับงานที่ต้องประมวลผลข้อมูลหนักๆ

---

## ⚙️ Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/your-username/task-manager.git
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up Environment Variables**

สร้างไฟล์ `.env.local` และเพิ่มค่าจาก Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Test Account**

| Field | Value |
|---|---|
| Username | `nontakorn` |

**4. Run the development server**

```bash
npm run dev
```

---

Built with ❤️ and AI Collaboration by **Nontakorn Singkrajom**
