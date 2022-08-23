const RANGE_4 = [0, 1, 2, 3];
const MAX_OF_4_BYTE_INTEGER = Math.pow(2, 32) - 1;
const writeArray = (out,arr) => {
    return new Promise((resolve,reject) => {
        if (!out.write(new Uint8Array(arr))) {
            out.once('drain', resolve);
        } else {
            process.nextTick(resolve);
        }
    });
}
const write4ByteInteger = async (number,out) => {
    if (number % 1 !== 0)
        throw Error("expect number to be an integer. Found: " + number);
    if (number < 0)
        throw Error("expect number to be positive");
    if (number > MAX_OF_4_BYTE_INTEGER)
        throw Error("expect number to be less than 2^32");
    await writeArray(out,RANGE_4.map(index => (number >> (index * 8)) % 256));
};
const write4ByteString = async (text,out) => {
    if (text.length !== 4)
        throw Error("4 Byte String should have 4 characters");
    await writeArray(out,text.split("").map(char => char.charCodeAt(0)));
};
const writeMAIN = async (voxStructure,out) => {
    await write4ByteString("MAIN",out);
    await write4ByteInteger(0,out);
    await write4ByteInteger(13*4 + voxStructure.xyzi.values.length*4 + voxStructure.rgba.values.length*4,out);
};
const writeSIZE = async (size,out) => {
    await write4ByteString("SIZE",out);
    await write4ByteInteger(12,out);
    await write4ByteInteger(0,out);
    await write4ByteInteger(size.x,out);
    await write4ByteInteger(size.y,out);
    await write4ByteInteger(size.z,out);
};
const writeXYZI = async (xyzi,out) => {
    await write4ByteString("XYZI",out);
    await write4ByteInteger(4*xyzi.values.length+4,out);
    await write4ByteInteger(0,out);
    await write4ByteInteger(xyzi.numVoxels,out);
    for (let i=0; i<xyzi.values.length;++i){
        await writeArray(out,[xyzi.values[i].x,xyzi.values[i].y,xyzi.values[i].z,xyzi.values[i].i]);
    }
};
const writeRGBA = async (rgba,out) => {
    await write4ByteString("RGBA",out);
    await write4ByteInteger(4*rgba.values.length,out);
    await write4ByteInteger(0,out);
    for (let i=0; i<rgba.values.length;++i){
        await writeArray(out,[rgba.values[i].r,rgba.values[i].g,rgba.values[i].b,rgba.values[i].a]);
    }
};
const writeRiffFile = async (voxStructure,out) => {
    await writeMAIN(voxStructure, out);
    await writeSIZE(voxStructure.size, out);
    await writeXYZI(voxStructure.xyzi, out);
    await writeRGBA(voxStructure.rgba, out);
};

// https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt
const saveVox = async (voxStructure,out) => {
    await write4ByteString("VOX ",out);
    await write4ByteInteger(150,out);
    await writeRiffFile(voxStructure,out);
};

module.exports = saveVox;