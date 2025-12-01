import winston from 'winston';
import path from 'path';
import { app } from 'electron';
// 获取日志存储路径
var getLogPath = function () {
    var logDir;
    if (process.platform === 'win32') {
        logDir = path.join(process.env.APPDATA || '', 'LanYaoTerminal', 'logs');
    }
    else if (process.platform === 'darwin') {
        logDir = path.join(app.getPath('home'), 'Library', 'Logs', 'LanYaoTerminal');
    }
    else {
        logDir = path.join(process.env.HOME || '', '.config', 'LanYaoTerminal', 'logs');
    }
    return logDir;
};
// 配置日志格式
var logFormat = winston.format.combine(winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston.format.printf(function (info) {
    return "".concat(info.timestamp, " [").concat(info.level.toUpperCase(), "] ").concat(info.message);
}));
// 创建日志记录器
var logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // 控制台输出
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat)
        }),
        // 文件输出
        new winston.transports.File({
            filename: path.join(getLogPath(), 'error.log'),
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(getLogPath(), 'combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        })
    ]
});
export default logger;
