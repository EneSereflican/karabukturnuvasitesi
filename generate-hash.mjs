import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash('YeniSifre123', 10);
console.log(hash);
