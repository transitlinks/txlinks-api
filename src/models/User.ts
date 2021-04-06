import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface UserAttributes {
  id: number;
  uuid: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  resetPasswordCode: string | null;
  emailConfirmed: boolean | null;
  photo: string | null;
  logins: number | null;
  avatar: string | null;
  avatarSource: string | null;
  avatarX: number | null;
  avatarY: number | null;
  avatarScale: number | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {

  public id!: number;
  public uuid!: string;
  public email!: string;
  public username!: string | null;
  public firstName!: string | null;
  public lastName!: string | null;
  public password!: string | null;
  public resetPasswordCode!: string | null;
  public emailConfirmed!: boolean | null;
  public photo!: string | null;
  public logins!: number | null;
  public avatar!: string | null;
  public avatarSource!: string | null;
  public avatarX!: number | null;
  public avatarY!: number | null;
  public avatarScale!: number | null;

  json() {
    return {
      uuid: this.get('uuid'),
      email: this.get('email'),
      username: this.get('username'),
      photo: this.get('photo'),
      avatar: this.get('avatar'),
      avatarSource: this.get('avatarSource'),
      avatarX: this.get('avatarX'),
      avatarY: this.get('avatarY'),
      avatarScale: this.get('avatarScale'),
      logins: this.get('logins')
    };
  }
}

User.init({

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

  email: {
    type: DataTypes.STRING(255),
    validate: { isEmail: true },
  },

  username: {
    type: DataTypes.STRING
  },

  firstName: {
    type: DataTypes.STRING
  },

  lastName: {
    type: DataTypes.STRING
  },

  password: {
    type: DataTypes.STRING
  },

  resetPasswordCode: {
    type: DataTypes.STRING
  },

  emailConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  photo: {
    type: DataTypes.STRING
  },

  logins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  avatar: {
    type: DataTypes.STRING
  },

  avatarSource: {
    type: DataTypes.STRING
  },

  avatarX: {
    type: DataTypes.FLOAT
  },

  avatarY: {
    type: DataTypes.FLOAT
  },

  avatarScale: {
    type: DataTypes.FLOAT
  },

}, {

  sequelize,
  modelName: 'User',
  indexes: [
    { fields: ['email'] },
  ]

});

export default User;
