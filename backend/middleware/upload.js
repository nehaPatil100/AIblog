import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { httpError } from '../utils/httpError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
});

const fileFilter = (req, file, cb) =>
  /^image\/(jpe?g|png|webp|gif)$/.test(file.mimetype)
    ? cb(null, true)
    : cb(httpError(400, 'Sirf JPG, PNG, WEBP ya GIF image allowed hai'));

export const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });

export function removeUpload(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
}
