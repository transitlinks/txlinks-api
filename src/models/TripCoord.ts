import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';
import User from './User';

interface TripCoordAttributes {
  id: number;
  uuid: string;
  latitude: number;
  longitude: number;
}

interface TripCoordCreationAttributes extends Optional<TripCoordAttributes, 'id'> {}

class TripCoord extends Model<TripCoordAttributes, TripCoordCreationAttributes> implements TripCoordAttributes {

  public id!: number;
  public uuid!: string;
  public latitude!: number;
  public longitude!: number;

  json() {
    return {
      uuid: this.get('uuid'),
      latitude: this.get('latitude'),
      longitude: this.get('longitude')
    };
  }
}

TripCoord.init({

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

  latitude: {
    type: DataTypes.FLOAT
  },

  longitude: {
    type: DataTypes.FLOAT
  }

}, {

  sequelize,
  modelName: 'TripCoord'

});

TripCoord.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default TripCoord;

