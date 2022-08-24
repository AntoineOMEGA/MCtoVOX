const readVox = require("vox-reader");
const saveVox = require("./vox-saver");

const fs = require('fs');
const { Schematic } = require('prismarine-schematic');
const minecraftData = require('minecraft-data');

//var mcVersion = schematic.version;
var mcData = minecraftData('1.18.2');

const blockColors = require("./blockColors")

const express = require('express');

var emptyVox = {
    size: { x: undefined, y: undefined, z: undefined},
    xyzi: {
        numVoxels: undefined,
        values: []
    },
    rgba: {
        values: []
    },
    ntrn: {},
    ngrp: {},
    nshp: {},
    layr: {}
};

var schematic;

async function loadSchematic () {
    // Read a schematic
    schematic = await Schematic.read(await fs.promises.readFile('examples/pirate_destroyer.schem'));

    emptyVox.size.x = schematic.size.x;
    emptyVox.size.y = schematic.size.y;
    emptyVox.size.z = schematic.size.z;

    let count = 0;

    let blockPalette = [];
    let invalidBlockIds = [];

    for (let i = 0; i < 256; i++) {
        emptyVox.rgba.values.push({r: 0, g: 0, b: 0, a: 255});
    }

    for (let cY = 0; cY < schematic.size.y; cY++) {
        for (let cZ = 0; cZ < schematic.size.z; cZ++) {
            for (let cX = 0; cX < schematic.size.x; cX++) {

                if (schematic.palette[schematic.blocks[count]] != 0) {
                    let blockId = mcData.blocksByStateId[schematic.palette[schematic.blocks[count]]].id;
                    
                    let paletteIndex = blockPalette.indexOf(blockId);

                    if (paletteIndex != -1) {
                        emptyVox.xyzi.values.push({ x:cX, y:cY, z:cZ, i: paletteIndex+1 });
                    } else {
                        let hexColor = blockColors[blockId];                      
                        if (hexColor != null && hexColor != undefined && hexColor != "") {
                            hexColor = hexColor.match(/.{1,2}/g);
                            let R = parseInt(hexColor[0], 16);
                            let G = parseInt(hexColor[1], 16);
                            let B = parseInt(hexColor[2], 16);
                            let A = parseInt(hexColor[3], 16);

                            blockPalette.push(blockId);
                            paletteIndex = blockPalette.indexOf(blockId);
                            emptyVox.rgba.values[paletteIndex] = {r: R, g: G, b: B, a: A};
                            emptyVox.xyzi.values.push({ x:cX, y:cY, z:cZ, i: paletteIndex+1 });   
                        } else {
                            if (invalidBlockIds.indexOf(blockId) == -1) {
                                invalidBlockIds.push(blockId);
                            }
                        }
                    }
                }
                count++;
            }
        }
    }

    emptyVox.xyzi.numVoxels = emptyVox.xyzi.values.length;
    
    let voxStream = fs.createWriteStream("frigate.vox");
    saveVox(emptyVox, voxStream).then(()=>{voxStream.end()})
    console.log(invalidBlockIds);
}

loadSchematic();

const app = express();
let port = 5001;
app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});