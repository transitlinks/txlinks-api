import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';
import User from './User';

interface TerminalAttributes {
  id: number;
  uuid: string;
  clientId: string | null;
  checkInUuid: string;
  type: string;
  transport: string;
  transportId: string | null,
  description: string | null,
  localityUuid: string,
  locality: string,
  localityLong: string,
  country: string,
  latitude: number,
  longitude: number,
  formattedAddress: string,
  linkedLocalityUuid: string | null,
  linkedLocality: string | null,
  linkedLocalityLong: string | null,
  linkedFormattedAddress: string | null,
  linkedTerminalId: number | null,
  date: string,
  time: string,
  priceAmount: number,
  priceCurrency: string,
  priceType: string,
  priceTerminalUuid: string | null
}

interface TerminalCreationAttributes extends Optional<TerminalAttributes, 'id'> {}

class Terminal extends Model<TerminalAttributes, TerminalCreationAttributes> implements TerminalAttributes {

  public id!: number;
  public uuid!: string;
  public clientId!: string | null;
  public checkInUuid!: string;
  public type!: string;
  public transport!: string;
  public transportId!: string | null;
  public description!: string | null;
  public localityUuid!: string;
  public locality!: string;
  public localityLong!: string;
  public country!: string;
  public latitude!: number;
  public longitude!: number;
  public formattedAddress!: string;
  public linkedLocalityUuid!: string | null;
  public linkedLocality!: string | null;
  public linkedLocalityLong!: string | null;
  public linkedFormattedAddress!: string | null;
  public linkedTerminalId!: number | null;
  public date!: string;
  public time!: string;
  public priceAmount!: number;
  public priceCurrency!: string;
  public priceType!: string;
  public priceTerminalUuid!: string | null;

  json() {
    const json: { id?: number } = this.toJSON();
    delete json.id;
    return json;
  }

}

Terminal.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    unique: true,
  },

  clientId: {
    type: DataTypes.STRING
  },

  checkInUuid: {
    type: DataTypes.STRING
  },

  type: {
    type: DataTypes.STRING
  },

  transport: {
    type: DataTypes.STRING
  },

  transportId: {
    type: DataTypes.STRING
  },

  description: {
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

  country: {
    type: DataTypes.STRING
  },

  latitude: {
    type: DataTypes.FLOAT
  },

  longitude: {
    type: DataTypes.FLOAT
  },

  formattedAddress: {
    type: DataTypes.STRING
  },

  linkedLocalityUuid: {
    type: DataTypes.STRING
  },

  linkedLocality: {
    type: DataTypes.STRING
  },

  linkedLocalityLong: {
    type: DataTypes.STRING
  },

  linkedFormattedAddress: {
    type: DataTypes.STRING
  },

  linkedTerminalId: {
    type: DataTypes.INTEGER
  },

  date: {
    type: DataTypes.DATE
  },

  time: {
    type: DataTypes.DATE
  },

  priceAmount: {
    type: DataTypes.FLOAT
  },

  priceCurrency: {
    type: DataTypes.STRING
  },

  priceType: {
    type: DataTypes.STRING
  },

  priceTerminalUuid: {
    type: DataTypes.STRING
  }

}, {

  sequelize,
  modelName: 'Terminal',
  indexes: [
    { fields: ['id', 'uuid', 'type', 'transport', 'locality', 'latitude', 'longitude', 'checkInUuid'] },
  ],

});

Terminal.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Terminal.hasOne(Terminal, {
  foreignKey: 'linkedTerminalId',
  as: 'linkedTerminal'
});

export default Terminal;
