#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const path_1 = __importDefault(require("path"));
const targz = __importStar(require("targz"));
const tmp = __importStar(require("tmp"));
const ganache = require("@celo/ganache-cli");
const contractkit_1 = require("@celo/contractkit");
const web3_utils_1 = require("web3-utils");
const utils_1 = require("./utils");
const gasLimit = 20000000;
const program = commander_1.default.program
    .version(require('../package.json').version)
    .description("Start ganache-cli with all Celo core contracts deployed.")
    .option("-p --port <port>", "Port to listen on.", "7545")
    .option("--core <core>", "Core contracts version to use. Default is `latest`. " +
    "Supports: v1, v2, v3, v4, v5", "v5")
    .option("-f --file <file>", "Path to custom core contracts build.")
    .option("--db <db>", "Path to store decompressed chain data.", undefined)
    .option("-t --test", "Run sanity tests and exit.")
    .parse(process.argv);
process.on('unhandledRejection', (reason, _promise) => {
    // @ts-ignore
    console.error('Unhandled Rejection at:', reason.stack || reason);
    process.exit(0);
});
async function runDevChainFromTar(filename, port, db, onStart) {
    let stopGanache;
    if (db != undefined) {
        await decompressChain(filename, db);
        stopGanache = await startGanache(db, {
            verbose: true,
            port: port,
            onStart: onStart,
        });
    }
    else {
        const chainCopy = tmp.dirSync({ keep: false, unsafeCleanup: true });
        console.log(`Creating tmp folder: ${chainCopy.name}`);
        await decompressChain(filename, chainCopy.name);
        stopGanache = await startGanache(chainCopy.name, {
            verbose: true,
            port: port,
            onStart: onStart,
        });
    }
    return stopGanache;
}
function decompressChain(tarPath, copyChainPath) {
    console.log('Decompressing chain');
    return new Promise((resolve, reject) => {
        targz.decompress({ src: tarPath, dest: copyChainPath }, (err) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                console.log('Chain decompressed');
                resolve();
            }
        });
    });
}
async function startGanache(datadir, opts) {
    const logFn = opts.verbose ? (...args) => console.log(...args) : () => { };
    const server = ganache.server({
        default_balance_ether: 200000000,
        logger: { log: logFn },
        network_id: 1101,
        db_path: datadir,
        mnemonic: utils_1.MNEMONIC,
        gasLimit,
        allowUnlimitedContractSize: true,
        vmErrorsOnRPCResponse: false,
        // Larger keep alive timeout to not drop connections accidentally during tests.
        keepAliveTimeout: 30000,
    });
    let stopCalled = false;
    const stop = () => new Promise((resolve, reject) => {
        if (stopCalled) {
            return;
        }
        console.log('Ganache STOPPING');
        stopCalled = true;
        server.close((err) => {
            console.log('Ganache STOPPED');
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
    const port = opts.port || 7545;
    await new Promise((resolve, reject) => {
        server.listen(port, (err, blockchain) => {
            if (err) {
                reject(err);
            }
            else {
                console.log('Ganache STARTED');
                resolve(blockchain);
                if (opts.onStart) {
                    opts.onStart(port, stop);
                }
            }
        });
    });
    return stop;
}
async function runTests(port, stop) {
    console.log(`[test] running...`);
    const kit = (0, contractkit_1.newKit)(`http://127.0.0.1:${port}`);
    const addresses = await kit.registry.addressMapping();
    for (const [contract, address] of addresses.entries()) {
        console.log(`[test]`, contract.toString().padEnd(30), address);
    }
    const goldToken = await kit.contracts.getGoldToken();
    const a0 = utils_1.ACCOUNT_ADDRESSES[0];
    const a1 = utils_1.ACCOUNT_ADDRESSES[1];
    const balance0 = await goldToken.balanceOf(a0);
    const balance1 = await goldToken.balanceOf(a1);
    console.log(`[test] balance: ${balance0.toString()}, ${balance1.toString()}`);
    // TODO(zviad): one day, when @celo/ganache-cli supports locally sigend transactions.
    // kit.addAccount(ACCOUNT_PRIVATE_KEYS[0])
    await goldToken
        .transfer(a1, (0, web3_utils_1.toWei)("10", "ether"))
        .sendAndWaitForReceipt({ from: a0 });
    const balance0_2 = await goldToken.balanceOf(a0);
    const balance1_2 = await goldToken.balanceOf(a1);
    console.log(`[test] balance: ${balance0_2.toString()}, ${balance1_2.toString()}`);
    await stop();
}
const opts = program.opts();
const filename = opts.file ? opts.file : path_1.default.join(__dirname, "..", "chains", `${opts.core}.tar.gz`);
const onStart = opts.test ? runTests : undefined;
tmp.setGracefulCleanup();
runDevChainFromTar(filename, opts.port, opts.db, onStart)
    .then((stop) => {
    process.once("SIGTERM", () => { stop(); });
    process.once("SIGINT", () => { stop(); });
});
//# sourceMappingURL=run.js.map