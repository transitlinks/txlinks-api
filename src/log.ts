const { LOG_LEVEL } = process.env;

export const getLog = (context: string) => {
  const log4js = require('log4js');
  const log = log4js.getLogger(context);
  log.level = LOG_LEVEL;
  return log;
};

export const graphLog = (request: any, name: string, values: { [key: string]: string | number | null }) => {

  let line = 'graphql-request=' + name;

  if (request.user) {
    line += ' user=' + request.user.uuid;
  } else {
    line += ' user=null';
  }

  if (values) {
    line += ' ' + values;
  }

  return line;

};


export default getLog('default');
