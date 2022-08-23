"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const ava_1 = __importDefault(require("ava"));
const index_1 = __importDefault(require("../index"));
const vox_reader_1 = __importDefault(require("vox-reader"));
const json_diff_1 = require("json-diff");
(0, ava_1.default)('test deer.vox', (t) => {
    const buffer = fs_1.default.readFileSync('./test/deer.vox');
    const vox = (0, vox_reader_1.default)(buffer);
    console.log(util_1.default.inspect(vox, false, null, true));
    const writtenVox = (0, index_1.default)(vox);
    const validationVox = (0, vox_reader_1.default)(writtenVox);
    const difference = (0, json_diff_1.diff)(vox, validationVox);
    t.assert(difference === undefined, "vox-reader and vox-writer should be the same (handling extended files):\n" + difference);
    const rawDifference = (0, json_diff_1.diff)(Array(...buffer), writtenVox);
    t.assert(rawDifference === undefined, "vox-reader and vox-writer should be the same (handling extended files) RAW:\n" + rawDifference);
    t.pass();
});
(0, ava_1.default)('test extended.vox', (t) => {
    const buffer = fs_1.default.readFileSync('./test/extended.vox');
    const vox = (0, vox_reader_1.default)(buffer);
    console.log(util_1.default.inspect(vox, false, null, true));
    const writtenVox = (0, index_1.default)(vox);
    const validationVox = (0, vox_reader_1.default)(writtenVox);
    const difference = (0, json_diff_1.diff)(vox, validationVox);
    t.assert(difference === undefined, "vox-reader and vox-writer should be the same (handling extended files):\n" + difference);
    const rawDifference = (0, json_diff_1.diff)(Array(...buffer), writtenVox);
    t.assert(rawDifference === undefined, "vox-reader and vox-writer should be the same (handling extended files) RAW:\n" + rawDifference);
    t.pass();
});
//# sourceMappingURL=writeVox.test.js.map