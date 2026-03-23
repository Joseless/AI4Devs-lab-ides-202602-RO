import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import express, { ErrorRequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDirectory),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Solo se permiten archivos PDF o DOC/DOCX.'));
      return;
    }

    cb(null, true);
  },
});

const createCandidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Se alcanzó el límite de solicitudes para crear candidatos. Intente nuevamente más tarde.',
  },
});

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
  }),
);
app.use(express.json());

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const validateCandidatePayload = (body: Request['body']): string | null => {
  const firstName = sanitizeText(body.firstName);
  const lastName = sanitizeText(body.lastName);
  const email = sanitizeText(body.email);
  const phone = sanitizeText(body.phone);
  const address = sanitizeText(body.address);
  const education = sanitizeText(body.education);
  const workExperience = sanitizeText(body.workExperience);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !address ||
    !education ||
    !workExperience
  ) {
    return 'Todos los campos del candidato son obligatorios.';
  }

  if (!isValidEmail(email)) {
    return 'El correo electrónico no tiene un formato válido.';
  }

  return null;
};

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

app.post(
  '/candidates',
  createCandidateLimiter,
  upload.single('cv'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationError = validateCandidatePayload(req.body);
      if (validationError) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ message: validationError });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          message:
            'Debe adjuntar el CV del candidato en formato PDF o DOC/DOCX.',
        });
        return;
      }

      const candidate = await prisma.candidate.create({
        data: {
          firstName: sanitizeText(req.body.firstName),
          lastName: sanitizeText(req.body.lastName),
          email: sanitizeText(req.body.email).toLowerCase(),
          phone: sanitizeText(req.body.phone),
          address: sanitizeText(req.body.address),
          education: sanitizeText(req.body.education),
          workExperience: sanitizeText(req.body.workExperience),
          cvFileName: req.file.originalname,
          cvMimeType: req.file.mimetype,
          cvStoragePath: req.file.path,
        },
      });

      res.status(201).json({
        message: 'Candidato añadido exitosamente.',
        candidate,
      });
    } catch (error: unknown) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      next(error);
    }
  },
);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const maybeCode = (err as { code?: string }).code;

  if (maybeCode === 'P2002') {
    res.status(409).json({
      message: 'Ya existe un candidato con el correo electrónico indicado.',
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        message: 'El CV excede el tamaño máximo permitido de 5 MB.',
      });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    if (err.message.includes('Solo se permiten archivos')) {
      res.status(400).json({ message: err.message });
      return;
    }
  }

  res.status(500).json({
    message: 'Ocurrió un error inesperado al procesar la solicitud.',
  });
};

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
