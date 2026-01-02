import _ from 'lodash';
import { AppConst } from '../constants';

const availableColors: any = {
  default: null,
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  grey: 90,
  redBright: 91,
  greenBright: 92,
  yellowBright: 93,
  blueBright: 94,
  magentaBright: 95,
  cyanBright: 96,
  whiteBright: 97
};

const resetColors = '\x1b[0m';

/**
 * Transport function options interface
 *
 * @interface TransportFunctionOptions
 * @property {any} msg - The formatted log message.
 * @property {any} rawMsg - The raw log message(s).
 * @property {{ severity: number; text: string }} level - The log level information.
 * @property {string | null} [extension] - The log extension or namespace.
 * @property {any} [options] - Additional options for the transport function.
 */
interface TransportFunctionOptions {
  msg: any;
  rawMsg: any;
  level: { severity: number; text: string };
  extension?: string | null;
  options?: any;
}

/**
 * Types Declaration
 *
 * @type {TransportFunctionType} Transport function type
 * @property {TransportFunctionOptions} props - The transport properties.
 * @returns {any} The result of the transport operation.
 */
type TransportFunctionType = (props: TransportFunctionOptions) => any;

/**
 * the log levels object
 *
 * @property {string} [key: string] - The log level key.
 */
interface LevelsType {
  [key: string]: number;
}

/**
 * the log method type
 *
 * @property {string} level - The log level.
 * @property {string | null} extension - The log extension or namespace.
 * @property {...any} msgs - The messages to log.
 * @returns {boolean} The result of the log operation.
 */
type LogMethodType = (level: string, extension: string | null, ...msgs: any[]) => boolean;

/**
 * the level log method type
 *
 * @property {string} [key: string] - The log level method.
 * @returns {boolean | void} The result of the log operation.
 */
type LevelLogMethodType = (...msgs: any[]) => boolean | void;

/**
 * the extended log type
 *
 * @property {string} [key: string] - The log level method.
 */
interface ExtendedLogType {
  [key: string]: LevelLogMethodType;
}

/**
 * Configuration logger type
 *
 * @interface ConfigLoggerType
 * @property {string} [severity] - The log severity level.
 * @property {TransportFunctionType | TransportFunctionType[]} [transport] - The transport function(s) for logging.
 * @property {any} [transportOptions] - Options for the transport function(s).
 * @property {LevelsType} [levels] - The log levels configuration.
 * @property {boolean} [async] - Whether to log asynchronously.
 * @property {Function} [asyncFunc] - The function to use for asynchronous logging.
 * @property {(msg: any) => string} [stringifyFunc] - Function to convert messages to strings.
 * @property {((level: string, extension: string | null, msgs: any) => string) | null} [formatFunc] - Function to format log messages.
 * @property {'time' | 'local' | 'utc' | 'iso' | ((date: Date) => string)} [dateFormat] - The date format for log messages.
 * @property {boolean} [printLevel] - Whether to print the log level in messages.
 * @property {boolean} [printDate] - Whether to print the date in messages.
 * @property {boolean} [fixedExtLvlLength] - Whether to use fixed length for extension and level strings.
 * @property {boolean} [enabled] - Whether logging is enabled.
 * @property {string[] | string | null} [enabledExtensions] - Specific extensions to enable for logging.
 */
interface ConfigLoggerType {
  severity?: string;
  transport?: TransportFunctionType | TransportFunctionType[];
  transportOptions?: any;
  levels?: LevelsType;
  async?: boolean;

  asyncFunc?: Function;
  stringifyFunc?: (msg: any) => string;
  formatFunc?: null | ((level: string, extension: string | null, msgs: any) => string);
  dateFormat?: 'time' | 'local' | 'utc' | 'iso' | ((date: Date) => string);
  printLevel?: boolean;
  printDate?: boolean;
  fixedExtLvlLength?: boolean;
  enabled?: boolean;
  enabledExtensions?: string[] | string | null;
}

/**
 * Console transport to send logs to a react native logger service
 *
 * @param {TransportFunctionOptions} props - The transport properties.
 * @returns {boolean} The result of the transport operation.
 */
const consoleTransport: TransportFunctionType = (props: TransportFunctionOptions): boolean => {
  if (!props) return false;

  let msg = props.msg;
  let color;

  if (
    props.options?.colors?.[props.level.text] &&
    availableColors[props.options.colors[props.level.text]]
  ) {
    color = `\x1b[${availableColors[props.options.colors[props.level.text]]}m`;
    msg = `${color}${msg}${resetColors}`;
  }

  if (props.extension && props.options?.extensionColors) {
    let extensionColor = '\x1b[7m';

    if (
      props.options.extensionColors[props.extension] &&
      availableColors[props.options.extensionColors[props.extension]]
    ) {
      extensionColor = `\x1b[${
        availableColors[props.options.extensionColors[props.extension]] + 10
      }m`;
    }

    const extStart = color ? resetColors + extensionColor : extensionColor;
    const extEnd = color ? resetColors + color : resetColors;
    msg = msg.replace(props.extension, `${extStart} ${props.extension} ${extEnd}`);
  }

  if (props.options?.consoleFunc) {
    props.options.consoleFunc(msg.trim());
  } else {
    // eslint-disable-next-line no-restricted-syntax
    console.log(msg.trim());
  }

  return true;
};

/**
 * Convert object to stringify
 *
 * @param msg - The message to stringify.
 * @returns {string} The stringified message.
 */
const stringifyFunc = (msg: any): string => {
  let stringMsg = '';
  if (typeof msg === 'string') {
    stringMsg = msg + ' ';
  } else if (typeof msg === 'function') {
    stringMsg = '[function ' + msg.name + '()] ';
  } else if (msg?.stack && msg?.message) {
    stringMsg = msg.message + ' ';
  } else {
    try {
      stringMsg = '\n' + JSON.stringify(msg, null, 2) + '\n';
    } catch {
      stringMsg += 'Undefined Message';
    }
  }
  return stringMsg;
};

/**
 * Reserved key log string to avoid overwriting other methods or properties
 */
const reservedKey: Set<string> = new Set([
  'extend',
  'enable',
  'disable',
  'getExtensions',
  'setSeverity',
  'getSeverity',
  'patchConsole',
  'getOriginalConsole'
]);

/**
 * Default configuration parameters for logger
 */
const defaultLogger: Required<ConfigLoggerType> = {
  severity: 'debug',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      v: 'green',
      d: 'cyan',
      i: 'blue',
      w: 'yellow',
      e: 'red',
      wtf: 'magenta'
    }
  },
  levels: {
    v: 0, // verbose
    d: 1, // debug
    i: 2, // info
    w: 3, // warn
    e: 4, // error
    wtf: 5 // what a terrible failure
  },
  async: true,
  asyncFunc: requestAnimationFrame,
  stringifyFunc: stringifyFunc,
  formatFunc: null,
  printLevel: true,
  printDate: true,
  dateFormat: 'time',
  fixedExtLvlLength: false,
  enabled: true,
  enabledExtensions: null
};

/**
 * Logger Main Class
 *
 * @class Logs
 * @implements {ConfigLoggerType}
 * @property {LevelsType} _levels - The log levels configuration.
 * @property {string} _level - The current log severity level.
 * @property {TransportFunctionType | TransportFunctionType[]} _transport - The transport function(s) for logging.
 * @property {any} _transportOptions - Options for the transport function(s).
 * @property {boolean} _async - Whether to log asynchronously.
 * @property {Function} _asyncFunc - The function to use for asynchronous logging.
 * @property {(msg: any) => string} _stringifyFunc - Function to convert messages to strings.
 * @property {((level: string, extension: string | null, msgs: any) => string) | null} _formatFunc - Function to format log messages.
 * @property {'time' | 'local' | 'utc' | 'iso' | ((date: Date) => string)} _dateFormat - The date format for log messages.
 * @property {boolean} _printLevel - Whether to print the log level in messages.
 * @property {boolean} _printDate - Whether to print the date in messages.
 * @property {boolean} _fixedExtLvlLength - Whether to use fixed length for extension and level strings.
 * @property {boolean} _enabled - Whether logging is enabled.
 * @property {string[] | null} _enabledExtensions - Specific extensions to enable for logging.
 * @property {string[] | null} _disabledExtensions - Specific extensions to disable for logging.
 * @property {string[]} _extensions - List of created log extensions.
 * @property {{ [key: string]: ExtendedLogType }} _extendedLogs - The extended loggers.
 * @property {typeof console | undefined} _originalConsole - The original console object before patching.
 * @property {number} _maxLevelsChars - Maximum characters in log levels for formatting.
 * @property {number} _maxExtensionsChars - Maximum characters in log extensions for formatting.
 * @throws {TypeError} If levels configuration is invalid.
 * @throws {Error} If reserved keys are used as log levels.
 * @throws {TypeError} If transport is not a function.
 * @throws {Error} If trying to extend or modify extended loggers.
 */
class Logs {
  private readonly _levels: LevelsType = defaultLogger.levels;
  private _level: string = defaultLogger.severity;
  private readonly _transport: TransportFunctionType | TransportFunctionType[];
  private readonly _transportOptions: any;
  private readonly _async: boolean;

  private readonly _asyncFunc: Function;
  private readonly _stringifyFunc: (msg: any) => string;
  private readonly _formatFunc?:
    | null
    | ((level: string, extension: string | null, msgs: any) => string);
  private readonly _dateFormat: 'time' | 'local' | 'utc' | 'iso' | ((date: Date) => string);
  private readonly _printLevel: boolean;
  private readonly _printDate: boolean;
  private readonly _fixedExtLvlLength: boolean;
  private _enabled: boolean;
  private _enabledExtensions: string[] | null = null;
  private _disabledExtensions: string[] | null = null;
  private readonly _extensions: string[] = [];
  private _extendedLogs: { [key: string]: ExtendedLogType } = {};
  private _originalConsole?: typeof console;
  private readonly _maxLevelsChars: number = 0;
  private _maxExtensionsChars: number = 0;

  /**
   * Constructor
   *
   * @param {Required<ConfigLoggerType>} config - The logger configuration.
   */
  constructor(config: Required<ConfigLoggerType>) {
    this._levels = config.levels;
    this._level = config.severity ?? Object.keys(this._levels)[0];

    this._transport = config.transport;
    this._transportOptions = config.transportOptions;

    this._asyncFunc = config.asyncFunc;
    this._async = config.async;

    this._stringifyFunc = config.stringifyFunc;
    this._formatFunc = config.formatFunc;
    this._dateFormat = config.dateFormat;
    this._printLevel = config.printLevel;
    this._printDate = config.printDate;
    this._fixedExtLvlLength = config.fixedExtLvlLength;

    this._enabled = config.enabled;

    if (Array.isArray(config.enabledExtensions)) {
      this._enabledExtensions = config.enabledExtensions;
    } else if (typeof config.enabledExtensions === 'string') {
      this._enabledExtensions = [config.enabledExtensions];
    }

    /** find max levels characters */
    if (this._fixedExtLvlLength) {
      this._maxLevelsChars = Math.max(...Object.keys(this._levels).map((k) => k.length));
    }

    /** Bind correct log levels methods */
    for (const level of Object.keys(this._levels)) {
      if (typeof level !== 'string') {
        throw new TypeError('ERROR: levels must be strings');
      }
      if (level.startsWith('_')) {
        throw new Error('ERROR: keys with first char "_" is reserved and cannot be used as levels');
      }
      if (reservedKey.has(level)) {
        throw new Error(`ERROR: [${level}] is a reserved key, you cannot set it as custom level`);
      }
      if (typeof this._levels[level] === 'number') {
        (this as any)[level] = this._log.bind(this, level, null);
      } else {
        throw new TypeError(`ERROR: [${level}] wrong level config`);
      }
    }
  }

  /**
   * Log messages methods and level filter
   *
   * @param {string} level - Log level
   * @param {string | null} extension - Log extension
   * @param {...any} msgs - Messages to log
   * @returns {boolean} The result of the log operation.
   */
  private readonly _log: LogMethodType = (
    level: string,
    extension: string | null,
    ...msgs: any[]
  ): boolean => {
    if (this._async) {
      return this._asyncFunc(() => {
        this._sendToTransport(level, extension, msgs);
      });
    } else {
      return this._sendToTransport(level, extension, msgs);
    }
  };

  /**
   * Send log to transport
   *
   * @param {string} level - Log level
   * @param {string | null} extension - Log extension
   * @param {any} msgs - Messages to log
   * @returns {boolean} The result of the log operation.
   */
  private readonly _sendToTransport = (
    level: string,
    extension: string | null,
    msgs: any
  ): boolean => {
    if (!this._enabled) return false;
    if (!this._isLevelEnabled(level)) {
      return false;
    }
    if (extension && !this._isExtensionEnabled(extension)) {
      return false;
    }
    const msg = this._formatMsg(level, extension, msgs);
    const transportProps: TransportFunctionOptions = {
      msg: msg,
      rawMsg: msgs,
      level: { severity: this._levels[level] ?? this._levels[this._level] ?? 0, text: level },
      extension: extension,
      options: this._transportOptions
    };
    if (Array.isArray(this._transport)) {
      for (const transport of this._transport) {
        if (typeof transport === 'function') {
          transport(transportProps);
        } else {
          throw new TypeError('ERROR: transport is not a function');
        }
      }
    } else if (typeof this._transport === 'function') {
      this._transport(transportProps);
    } else {
      throw new TypeError('ERROR: transport is not a function');
    }
    return true;
  };

  /**
   * Get original console
   *
   * @param {any} msg - The message to stringify.
   * @returns {string} The stringified message.
   */
  private readonly _stringifyMsg = (msg: any): string => {
    return this._stringifyFunc(msg);
  };

  /**
   * Format log message
   *
   * @param {string} level - Log level
   * @param {string | null} extension - Log extension
   * @param {any} msgs - Messages to log
   * @returns {string} The formatted log message.
   */
  private readonly _formatMsg = (level: string, extension: string | null, msgs: any): string => {
    if (typeof this._formatFunc === 'function') {
      return this._formatFunc(level, extension, msgs);
    }

    let nameTxt: string = '';
    if (extension) {
      const extStr = this._fixedExtLvlLength
        ? extension?.padEnd(this._maxExtensionsChars, ' ')
        : extension;
      nameTxt = `${extStr} | `;
    }

    let dateTxt: string = '';
    if (this._printDate) {
      if (typeof this._dateFormat === 'string') {
        const dateFormatOptions = {
          time: `${new Date().toLocaleTimeString()} | `,
          local: `${new Date().toLocaleString()} | `,
          utc: `${new Date().toUTCString()} | `,
          iso: `${new Date().toISOString()} | `
        };
        dateTxt = dateFormatOptions[this._dateFormat];
      } else if (typeof this._dateFormat === 'function') {
        dateTxt = this._dateFormat(new Date());
      }
    }

    let levelTxt = '';
    if (this._printLevel) {
      levelTxt = this._fixedExtLvlLength ? level.padEnd(this._maxLevelsChars, ' ') : level;
      levelTxt = `${levelTxt?.toUpperCase()} : `;
    }

    let stringMsg: string = dateTxt + nameTxt + levelTxt;

    if (Array.isArray(msgs)) {
      for (const msg of msgs) {
        stringMsg += this._stringifyMsg(msg);
      }
    } else {
      stringMsg += this._stringifyMsg(msgs);
    }

    return stringMsg;
  };

  /**
   * Return true if level is enabled
   *
   * @param  {string} level - Log level
   * @returns {boolean} True if level is enabled
   */
  private readonly _isLevelEnabled = (level: string): boolean => {
    const current = this._levels[this._level];
    const incoming = this._levels[level];

    if (incoming === undefined || current === undefined) {
      return false;
    }

    return incoming >= current;
  };

  /**
   * Return true if extension is enabled
   *
   * @param {string} extension - Log extension
   * @returns {boolean} True if extension is enabled
   */
  private readonly _isExtensionEnabled = (extension: string): boolean => {
    if (this._disabledExtensions?.length) {
      return !this._disabledExtensions.includes(extension);
    }
    if (!this._enabledExtensions || this._enabledExtensions.includes(extension)) {
      return true;
    }
    return false;
  };

  /**
   * Extend logger with a new extension
   *
   * @param {string} extension - Log extension
   * @returns {ExtendedLogType} The extended log type.
   */
  extend = (extension: string): ExtendedLogType => {
    if (extension === 'console') {
      throw new Error('ERROR: you cannot set [console] as extension, use patchConsole instead');
    }
    this._extendedLogs[extension] = {};
    if (this._extensions.includes(extension)) {
      return this._extendedLogs[extension];
    }
    this._extensions.push(extension);
    const extendedLog = this._extendedLogs[extension];
    for (const level of Object.keys(this._levels)) {
      /**
       * Log method for each level
       *
       * @param {...any} msgs - Messages to log
       * @returns {void} None
       */
      extendedLog[level] = (...msgs: any): void => {
        this._log(level, extension, ...msgs);
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.extend = (): void => {
        throw new Error('ERROR: you cannot extend a logger from an already extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.enable = (): void => {
        throw new Error('ERROR: You cannot enable a logger from extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.disable = (): void => {
        throw new Error('ERROR: You cannot disable a logger from extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.getExtensions = (): void => {
        throw new Error('ERROR: You cannot get extensions from extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.setSeverity = (): void => {
        throw new Error('ERROR: You cannot set severity from extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.getSeverity = (): void => {
        throw new Error('ERROR: You cannot get severity from extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.patchConsole = (): void => {
        throw new Error('ERROR: You cannot patch console from extended logger');
      };
      /**
       * Disable logger or extension
       *
       * @returns {void} None
       * @throws {Error} If trying to extend or modify extended loggers.
       */
      extendedLog.getOriginalConsole = (): void => {
        throw new Error('ERROR: You cannot get original console from extended logger');
      };
    }

    this._maxExtensionsChars = Math.max(...this._extensions.map((ext: string) => ext.length));
    return extendedLog;
  };

  /**
   * Enable logger or extension
   *
   * @param {string} [extension] - Log extension
   * @returns {boolean} The result of the enable operation.
   * @throws {Error} If extension does not exist.
   */
  enable = (extension?: string): boolean => {
    if (!extension) {
      this._enabled = true;
      return true;
    }

    if (this._extensions.includes(extension)) {
      if (this._enabledExtensions) {
        if (!this._enabledExtensions.includes(extension)) {
          this._enabledExtensions.push(extension);
        }
      }
    } else {
      throw new Error(`ERROR: Extension [${extension}] not exist`);
    }

    if (this._disabledExtensions?.includes(extension)) {
      const extIndex = this._disabledExtensions.indexOf(extension);
      if (extIndex > -1) {
        this._disabledExtensions.splice(extIndex, 1);
      }
      if (!this._disabledExtensions.length) {
        this._disabledExtensions = null;
      }
    }

    return true;
  };

  /**
   * Disable logger or extension
   *
   * @param {string} [extension] - Log extension
   * @returns {boolean} The result of the disable operation.
   * @throws {Error} If extension does not exist.
   */
  disable = (extension?: string): boolean => {
    if (!extension) {
      this._enabled = false;
      return true;
    }
    if (this._extensions.includes(extension)) {
      if (this._enabledExtensions) {
        const extIndex = this._enabledExtensions.indexOf(extension);
        if (extIndex > -1) {
          this._enabledExtensions.splice(extIndex, 1);
        }
        if (!this._enabledExtensions.length) {
          this._enabledExtensions = null;
        }
      }
    } else {
      throw new Error(`ERROR: Extension [${extension}] not exist`);
    }

    if (!this._disabledExtensions) {
      this._disabledExtensions = [];
      this._disabledExtensions.push(extension);
    } else if (!this._disabledExtensions.includes(extension)) {
      this._disabledExtensions.push(extension);
    }
    return true;
  };

  /**
   * Return all created extensions
   *
   * @returns {string[]} List of created extensions
   */
  getExtensions = (): string[] => {
    return this._extensions;
  };

  /**
   * Set log severity API
   *
   * @param {string} [level] - Log level
   * @returns {string} The current log severity level.
   * @throws {Error} If level does not exist.
   */
  setSeverity = (level: string): string => {
    if (level in this._levels) {
      this._level = level;
    } else {
      throw new Error(`ERROR: Level [${level}] not exist`);
    }
    return this._level;
  };

  /**
   * Get current log severity API
   *
   * @returns {string} The current log severity level.
   */
  getSeverity = (): string => {
    return this._level;
  };

  /**
   * Monkey Patch global console.log
   *
   * @returns {void} None
   */
  patchConsole = (): void => {
    const extension = 'console';
    const levelKeys = Object.keys(this._levels);

    this._originalConsole ??= console;

    if (!this._transportOptions.consoleFunc) {
      this._transportOptions.consoleFunc = this._originalConsole.log;
    }

    /**
     * Log method for console.log
     *
     * @param {...any} msgs - Messages to log
     */
    console.log = (...msgs: any): void => {
      this._log(levelKeys[0] ?? '', extension, ...msgs);
    };

    for (const level of levelKeys) {
      if ((console as any)[level]) {
        /**
         * Log method for each level
         *
         * @param {...any} msgs - Messages to log
         */
        (console as any)[level] = (...msgs: any): void => {
          this._log(level, extension, ...msgs);
        };
      } else {
        this._originalConsole?.log(
          `WARNING: "${level}" method does not exist in console and will not be available`
        );
      }
    }
  };
}

/**
 * Create a logger object. All params will take default values if not passed.
 * each levels has its level severity so we can filter logs with < and > operators
 * all subsequent levels to the one selected will be exposed (ordered by severity asc)
 * through the transport
 *
 * @param config - Logger configuration
 * @returns {Omit<Logs, 'extend'> & LoggerType & ExtendMethods} The created logger object.
 */
const createLogger = <Y extends string>(config?: ConfigLoggerType) => {
  /**
   * Level methods type
   */
  type LevelMethods<levels extends string> = {
    [key in levels]: (...args: unknown[]) => void;
  };

  /**
   * Logger type
   */
  type LoggerType = LevelMethods<Y>;

  /**
   * Extend methods interface
   */
  interface ExtendMethods {
    extend: (extension: string) => LoggerType;
  }

  const mergedConfig = _.merge(defaultLogger, config);
  return new Logs(mergedConfig) as unknown as Omit<Logs, 'extend'> & LoggerType & ExtendMethods;
};

export const logger = createLogger<'v' | 'd' | 'i' | 'w' | 'e' | 'wtf'>(defaultLogger);

if (!AppConst.isDevelopment) {
  logger.disable();
}
