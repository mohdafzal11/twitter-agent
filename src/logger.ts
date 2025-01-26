import winston from 'winston';
import NewrelicTransport from 'winston-newrelic-agent-transport';

interface LoggerStream {
  write: (message: string) => void;
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

const stream: LoggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

(logger as any).stream = stream;

const options: Record<string, unknown> = {};
logger.add(new NewrelicTransport(options));

export default logger;
