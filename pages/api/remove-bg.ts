import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { removeBackground } from '@imgly/background-removal-node';

console.log('[Server] Initializing /api/remove-bg');

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const filename = `${Date.now()}${path.extname(file.originalname)}`;
      console.log('[Upload] Filename set:', filename);
      cb(null, filename);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    console.error('[Error] Middleware Error:', error);
    res.status(500).json({ error: error.message });
  },
  onNoMatch(_req, res) {
    console.warn('[Warn] Invalid method:', _req.method);
    res.status(405).json({ error: 'Method not allowed' });
  },
});

apiRoute.use((req, res, next) => {
  console.log(`[Middleware] ${req.method} ${req.url}`);
  next();
});

apiRoute.use(upload.single('image'));

apiRoute.post(async (req: any, res) => {
  if (!req.file) {
    console.error('[Error] No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  console.log('[Process] Uploaded file path:', filePath);

  try {
    console.time('[Process] Background removal');
    const blob = await removeBackground(filePath);
    const buffer = Buffer.from(await blob.arrayBuffer());
    console.timeEnd('[Process] Background removal');

    await fs.unlink(filePath);
    console.log('[Cleanup] Temp file deleted:', filePath);

    res.status(200).json({
      message: 'Success',
      image: `data:image/png;base64,${buffer.toString('base64')}`,
    });
  } catch (err: any) {
    console.error('[Error] Background removal failed:', err.message);
    await fs.unlink(filePath).catch(() => {
      console.warn('[Warn] Failed to delete temp file:', filePath);
    });

    res.status(500).json({ error: err.message });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;
