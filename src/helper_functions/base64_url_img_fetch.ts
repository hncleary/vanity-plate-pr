/** Given an image URL, return that image in base64 format */
export async function getBase64ImageFromUrl(imgUrl: string): Promise<string> {
    if (!imgUrl) {
        return '';
    }
    const fetchImageUrl = await fetch(imgUrl);
    const responseArrBuffer = await fetchImageUrl.arrayBuffer();
    const toBase64 = `data:${fetchImageUrl.headers.get('Content-Type') || 'image/png'};base64,${Buffer.from(
        responseArrBuffer
    ).toString('base64')}`;
    return toBase64;
}
