import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { Logger } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class RewardPhotoInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RewardPhotoInterceptor.name);

  constructor(private readonly storageService: StorageService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      this.logger.warn('Aucun fichier photo fourni');
      return next.handle();
    }

    try {
      // Vérifier le type MIME
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        throw new BadRequestException(
          'Format de fichier non supporté. Seuls JPEG et PNG sont acceptés.',
        );
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Le fichier est trop volumineux. Taille maximum : 5MB');
      }

      this.logger.debug(`Traitement du fichier : ${file.originalname}`);

      // Traiter l'image avec Sharp
      const processedImageBuffer = await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      this.logger.debug('Image traitée avec succès');

      // Sauvegarder l'image traitée
      const filename = await this.storageService.save(
        {
          ...file,
          buffer: processedImageBuffer,
        },
        'rewards',
      );

      this.logger.debug(`Image sauvegardée : ${filename}`);

      // Mettre à jour le nom du fichier dans la requête
      request.file.filename = filename;
      request.file.path = `uploads/rewards/${filename}`;

      return next.handle();
    } catch (error) {
      this.logger.error(`Erreur lors du traitement de l'image : ${error.message}`, error.stack);
      throw error;
    }
  }
}
