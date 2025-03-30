import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { InvalidLogoException } from '../exceptions/application.exceptions';

export const ApplicationLogoInterceptor = FileInterceptor('logo', {
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (!file) {
      callback(new InvalidLogoException("Aucun fichier n'a été uploadé."), false);
      return;
    }

    const fileExtension = extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      callback(new InvalidLogoException('Seuls les fichiers JPG et PNG sont acceptés.'), false);
      return;
    }

    if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
      callback(new InvalidLogoException('Le fichier doit être une image JPG ou PNG.'), false);
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
