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

let palette;
fs.readFile('./military_bomber.vox', (error, buffer) => {
    if (error) throw error;
        let data = readVox(buffer);
        palette = data.rgba.values;
        console.log(data);
});

var schematic;

async function loadSchematic () {
    // Read a schematic
    schematic = await Schematic.read(await fs.promises.readFile('examples/military_bomber.schem'));

    emptyVox.size.x = schematic.size.x;
    emptyVox.size.y = schematic.size.y;
    emptyVox.size.z = schematic.size.z;

    let count = 0;

    let blockPalette = {};
    let blockCount = 0;

    for (let cY = 0; cY < schematic.size.y; cY++) {
        for (let cZ = 0; cZ < schematic.size.z; cZ++) {
            for (let cX = 0; cX < schematic.size.x; cX++) {

                //Color Selector
                if (schematic.palette[schematic.blocks[count]] != 0) {
                    let blockId = mcData.blocksByStateId[schematic.palette[schematic.blocks[count]]].id;
                    let colorIndex;
                    if (blockPalette[blockId] != undefined) {
                        colorIndex = blockPalette[blockId];
                        emptyVox.xyzi.values.push({ x:cX, y:cY, z:cZ, i: colorIndex });
                    } else {
                        blockPalette[blockId] = blockCount;

                        let hexColor = blockColors[blockId];                      
                        if (hexColor != null && hexColor != undefined && hexColor != "") {
                            hexColor = hexColor.match(/.{1,2}/g);
                            let R = parseInt(hexColor[0], 16);
                            let G = parseInt(hexColor[1], 16);
                            let B = parseInt(hexColor[2], 16);
                            let A = parseInt(hexColor[3], 16);

                            colorIndex = blockPalette[blockId];
                            emptyVox.rgba.values.push({r: 32, g: 32, b: 32, a: A});
                            emptyVox.xyzi.values.push({ x:cX, y:cY, z:cZ, i: colorIndex });
                        }
                    }
                }
                count++;
            }
        }
    }

    emptyVox.xyzi.numVoxels = emptyVox.xyzi.values.length;
    console.log(emptyVox);
    
    let voxStream = fs.createWriteStream("frigate.vox");
    saveVox(emptyVox, voxStream).then(()=>{voxStream.end()})
}

loadSchematic();

const app = express();
let port = 5000;
app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});