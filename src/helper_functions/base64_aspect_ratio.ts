const sizeOf = require('image-size');

export function getBase64AspectRatio(base64: string): number {
    const img = Buffer.from(base64.substr(23), 'base64');
    const dimensions = sizeOf(img);
    return dimensions.width / dimensions.height;
}
