import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';
import User from './User';
import CheckIn from './CheckIn';

interface TripAttributes {
  id: number;
  uuid: string;
  name: string;
  firstCheckInId: number;
  lastCheckInId: number;
}

interface TripCreationAttributes extends Optional<TripAttributes, 'id'> {}

class Trip extends Model<TripAttributes, TripCreationAttributes> implements TripAttributes {

  public id!: number;
  public uuid!: string;
  public name!: string;
  public lastCheckInId!: number;
  public firstCheckInId!: number;

  json() {
    return {
      uuid: this.get('uuid'),
      name: this.get('name')
    };
  }
}

Trip.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    unique: true
  },

  name: {
    type: DataTypes.STRING(255)
  },

  firstCheckInId: {
    type: DataTypes.INTEGER
  },

  lastCheckInId: {
    type: DataTypes.INTEGER
  }

}, {

  sequelize,
  modelName: 'Trip',
  indexes: [
    { fields: ['name'] },
  ]

});

Trip.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Trip.belongsTo(CheckIn, {
  foreignKey: 'firstCheckInId',
  as: 'firstCheckIn'
});

Trip.belongsTo(CheckIn, {
  foreignKey: 'lastCheckInId',
  as: 'lastCheckIn'
});

export default Trip;

