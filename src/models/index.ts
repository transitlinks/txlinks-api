import sequelize from '../sequelize';
import User from './User';

export { User };

const sync = () => {
  return sequelize.sync({ force: false, logging: console.log });
};

export default { sync };
