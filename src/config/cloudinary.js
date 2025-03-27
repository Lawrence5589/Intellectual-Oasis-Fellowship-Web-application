import { Cloudinary } from '@cloudinary/url-gen';

export const cldConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dkyoxq3cc',
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
};

export const cld = new Cloudinary({
  cloud: {
    cloudName: cldConfig.cloudName
  }
}); 