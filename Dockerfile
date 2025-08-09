# ใช้ Node แบบเบา
FROM node:20-alpine

# ติดตั้ง pg_dump + timezone
RUN apk add --no-cache postgresql-client tzdata

WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# คัดลอกโค้ด
COPY . .

# กำหนดค่าเริ่มต้นในคอนเทนเนอร์
ENV NODE_ENV=production
# ตั้ง timezone ตามต้องการ
ENV TZ=Asia/Bangkok

# โฟลเดอร์สำหรับเก็บ backup (ผูก volume ข้างนอกได้)
VOLUME ["/backups"]
ENV BACKUP_DIR=/backups

# รันสคริปต์ cron ของเรา
CMD ["node", "backup.js"]
