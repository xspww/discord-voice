const { tokens, channelIds } = require('./config');
const { startSession } = require('./voice');

console.log(`🚀 กำลังเริ่มการทำงานทั้งหมด ${channelIds.length} Session(s) (E2EE / DAVE Protocol ready)...`);

// รองรับหลายห้องด้วย token เดียว: สร้าง gateway session แยกต่อห้อง
// (Discord อนุญาตให้ account เดียวอยู่ในหลายห้องเสียงได้ถ้าคนละ session/device)
// เริ่มทีละ session พร้อมหน่วงเวลา เพื่อเลี่ยง rate limit ตอน login หลาย session
(async () => {
    for (let index = 0; index < channelIds.length; index++) {
        // ถ้ามี token ไม่พอ ใช้ token แรกซ้ำ (หลาย session ด้วย account เดียว)
        const token = tokens[index] || tokens[0];
        startSession(token, channelIds[index], index);
        if (index < channelIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
})();
