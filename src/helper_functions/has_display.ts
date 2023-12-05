const si = require('systeminformation');

export async function systemHasDisplay(): Promise<boolean> {
    const graphics = await si.graphics();
    return graphics.displays.length > 0;
}
