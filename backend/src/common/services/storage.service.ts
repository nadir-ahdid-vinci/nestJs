import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {}

  async save(file: Express.Multer.File | string, directory: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', directory);
      await fs.mkdir(uploadDir, { recursive: true });

      // Si file est une chaîne, c'est déjà un nom de fichier
      if (typeof file === 'string') {
        return file;
      }

      // Génération d'un nom de fichier sécurisé
      const fileHash = crypto
        .createHash('sha256')
        .update(file.originalname + Date.now())
        .digest('hex');
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileHash}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Vérification du type MIME
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException('Type de fichier non autorisé');
      }

      // Vérification de la taille
      const maxSize = this.configService.get<number>('MAX_FILE_SIZE') || 5 * 1024 * 1024; // 5MB par défaut
      if (file.size > maxSize) {
        throw new BadRequestException('Fichier trop volumineux');
      }

      // Sauvegarde du fichier
      await fs.writeFile(filePath, file.buffer);

      return fileName;
    } catch (error) {
      this.logger.error(`Erreur lors de la sauvegarde du fichier: ${error.message}`);
      throw error;
    }
  }

  async delete(fileName: string, directory: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'uploads', directory, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du fichier: ${error.message}`);
      throw error;
    }
  }
}
