const logger = {
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
  info: (message: string, data?: any) => {
    console.info(message, data);
  },
  debug: (message: string, data?: any) => {
    console.debug(message, data);
  }
};

export default logger;