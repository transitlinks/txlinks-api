import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';
import User from './User';

interface CheckInAttributes {

  id: number;
  uuid: string;
  clientId: string | null;
  placeId: string | null;
  localityUuid: string;
  locality: string;
  localityLong: string;
  adminArea1: string | null;
  adminArea2: string | null;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  departureId: number | null;
  linkIndex: number | null;
  likes: number | null;
  userId: number;

  createdAt?: Date;

}

interface CheckInCreationAttributes extends Optional<CheckInAttributes, 'id'> {}

class CheckIn extends Model<CheckInAttributes, CheckInCreationAttributes> implements CheckInAttributes {

  public id!: number;
  public uuid!: string;
  public clientId!: string | null;
  public placeId!: string | null;
  public localityUuid!: string;
  public locality!: string;
  public localityLong!: string;
  public adminArea1!: string | null;
  public adminArea2!: string | null;
  public country!: string;
  public formattedAddress!: string;
  public latitude!: number;
  public longitude!: number;
  public departureId!: number | null;
  public linkIndex!: number | null;
  public likes!: number | null;
  public userId: number;

  public createdAt!: Date;

  json() {
    return {
      uuid: this.get('uuid'),
      localityUuid: this.get('localityUuid'),
      locality: this.get('locality'),
    };
  }
}

CheckIn.init({

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

  clientId: {
    type: DataTypes.STRING
  },

  placeId: {
    type: DataTypes.STRING
  },

  localityUuid: {
    type: DataTypes.STRING
  },

  locality: {
    type: DataTypes.STRING
  },

  localityLong: {
    type: DataTypes.STRING
  },

  adminArea1: {
    type: DataTypes.STRING
  },

  adminArea2: {
    type: DataTypes.STRING
  },

  country: {
    type: DataTypes.STRING
  },

  formattedAddress: {
    type: DataTypes.STRING
  },

  latitude: {
    type: DataTypes.FLOAT
  },

  longitude: {
    type: DataTypes.FLOAT
  },

  departureId: {
    type: DataTypes.INTEGER
  },

  linkIndex: {
    type: DataTypes.INTEGER
  },

  likes: {
    type: DataTypes.INTEGER
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {

  sequelize,
  modelName: 'CheckIn',
  indexes: [
    { fields: ['id', 'uuid', 'clientId', 'placeId', 'nextCheckInId', 'prevCheckInId', 'latitude', 'longitude', 'departureId', 'likes'] },
  ]

});

CheckIn.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default CheckIn;

