// import { generateReactHelpers } from '@uploadthing/react';

// import type { OurFileRouter } from '@/app/api/uploadthing/core';

// export const { uploadFiles } = generateReactHelpers<OurFileRouter>();

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { uploadFiles } = generateReactHelpers<OurFileRouter>();
