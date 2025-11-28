declare module 'formidable' {
  import { IncomingMessage } from 'http';
  export interface File {
    filepath?: string;
    path?: string;
    originalFilename?: string;
    mimetype?: string;
  }
  export interface Files {
    [key: string]: File | File[];
  }
  export class IncomingForm {
    constructor(options?: any);
    parse(req: IncomingMessage, callback: (err: any, fields: any, files: Files) => void): void;
  }
  const formidable: {
    IncomingForm: typeof IncomingForm;
  };
  export default formidable;
}
