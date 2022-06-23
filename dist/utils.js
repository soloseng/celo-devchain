"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mineToNextEpoch = exports.increaseTime = exports.mineBlock = exports.sendJSONRpc = exports.ACCOUNT_ADDRESSES = exports.ACCOUNT_PRIVATE_KEYS = exports.MNEMONIC = exports.NETWORK_ID = void 0;
exports.NETWORK_ID = 1101;
exports.MNEMONIC = 'concert load couple harbor equip island argue ramp clarify fence smart topic';
exports.ACCOUNT_PRIVATE_KEYS = [
    '0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d',
    '0x5d862464fe9303452126c8bc94274b8c5f9874cbd219789b3eb2128075a76f72',
    '0xdf02719c4df8b9b8ac7f551fcb5d9ef48fa27eef7a66453879f4d8fdc6e78fb1',
    '0xff12e391b79415e941a94de3bf3a9aee577aed0731e297d5cfa0b8a1e02fa1d0',
    '0x752dd9cf65e68cfaba7d60225cbdbc1f4729dd5e5507def72815ed0d8abc6249',
    '0xefb595a0178eb79a8df953f87c5148402a224cdf725e88c0146727c6aceadccd',
    '0x83c6d2cc5ddcf9711a6d59b417dc20eb48afd58d45290099e5987e3d768f328f',
    '0xbb2d3f7c9583780a7d3904a2f55d792707c345f21de1bacb2d389934d82796b2',
    '0xb2fd4d29c1390b71b8795ae81196bfd60293adf99f9d32a0aff06288fcdac55f',
    '0x23cb7121166b9a2f93ae0b7c05bde02eae50d64449b2cbb42bc84e9d38d6cc89',
];
exports.ACCOUNT_ADDRESSES = [
    '0x5409ED021D9299bf6814279A6A1411A7e866A631',
    '0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb',
    '0xE36Ea790bc9d7AB70C55260C66D52b1eca985f84',
    '0xE834EC434DABA538cd1b9Fe1582052B880BD7e63',
    '0x78dc5D2D739606d31509C31d654056A45185ECb6',
    '0xA8dDa8d7F5310E4A9E24F8eBA77E091Ac264f872',
    '0x06cEf8E666768cC40Cc78CF93d9611019dDcB628',
    '0x4404ac8bd8F9618D27Ad2f1485AA1B2cFD82482D',
    '0x7457d5E02197480Db681D3fdF256c7acA21bDc12',
    '0x91c987bf62D25945dB517BDAa840A6c661374402',
];
function sendJSONRpc(provider, method, params) {
    return new Promise((resolve, reject) => {
        provider.send({
            jsonrpc: '2.0',
            id: Date.now() + Math.floor(Math.random() * (1 + 100 - 1)),
            method: method,
            params: params,
        }, (err, res) => (err ? reject(err) : resolve(res)));
    });
}
exports.sendJSONRpc = sendJSONRpc;
function mineBlock(provider) {
    return sendJSONRpc(provider, 'evm_mine', []);
}
exports.mineBlock = mineBlock;
async function increaseTime(provider, secondsToAdd) {
    await sendJSONRpc(provider, 'evm_increaseTime', [secondsToAdd]);
    return mineBlock(provider);
}
exports.increaseTime = increaseTime;
async function mineToNextEpoch(kit) {
    const currentBlock = await kit.web3.eth.getBlockNumber();
    const currentEpoch = await kit.getEpochNumberOfBlock(currentBlock);
    const nextEpochBlock = await kit.getFirstBlockNumberForEpoch(currentEpoch + 1);
    for (let i = 0; i < nextEpochBlock - currentBlock; i += 1) {
        await mineBlock(kit.web3.currentProvider);
    }
}
exports.mineToNextEpoch = mineToNextEpoch;
//# sourceMappingURL=utils.js.map