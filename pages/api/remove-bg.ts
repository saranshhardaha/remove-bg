import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { removeBackground } from '@imgly/background-removal-node';

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error.message });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: 'Method not allowed' });
  },
});

apiRoute.use(upload.single('image'));

apiRoute.post(async (req: any, res) => {
  const filePath = req.file.path;
  try {
    const blob = await removeBackground(filePath);
    const buffer = Buffer.from(await blob.arrayBuffer());
    await fs.unlink(filePath);

    res.status(200).json({
      message: 'Success',
      image: `data:image/png;base64,${buffer.toString('base64')}`,
    });
  } catch (err: any) {
    await fs.unlink(filePath).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;