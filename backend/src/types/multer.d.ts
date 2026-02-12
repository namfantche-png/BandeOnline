import 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File extends import('multer').File {}
    }
  }
}
