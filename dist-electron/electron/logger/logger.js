"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = __importDefault(require("winston"));
var path_1 = __importDefault(require("path"));
var electron_1 = require("electron");
// 获取日志存储路径
var getLogPath = function () {
    var logDir;
    if (process.platform === 'win32') {
        logDir = path_1.default.join(process.env.APPDATA || '', 'LanYaoTerminal', 'logs');
    }
    else if (process.platform === 'darwin') {
        logDir = path_1.default.join(electron_1.app.getPath('home'), 'Library', 'Logs', 'LanYaoTerminal');
    }
    else {
        logDir = path_1.default.join(process.env.HOME || '', '.config', 'LanYaoTerminal', 'logs');
    }
    return logDir;
};
// 配置日志格式
var logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.printf(function (info) {
    return "".concat(info.timestamp, " [").concat(info.level.toUpperCase(), "] ").concat(info.message);
}));
// 创建日志记录器
var logger = winston_1.default.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // 控制台输出
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
        }),
        // 文件输出
        new winston_1.default.transports.File({
            filename: path_1.default.join(getLogPath(), 'error.log'),
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(getLogPath(), 'combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        })
    ]
});
exports.default = logger;
