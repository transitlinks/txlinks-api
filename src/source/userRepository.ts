import { getLog } from '../log';
const log = getLog('source/userRepository');

import User from '../models/User';
import { QueryTypes } from 'sequelize';
import sequelize, { Values, Where } from '../sequelize';

export const getUserIdByUuid = async (uuid: string) => {

  const user = await User.findOne({
    attributes: [ 'id' ],
    where: { uuid }
  });

  return user?.id;

};

export const getUserUuidById = async (id: number) => {

  const user = await User.findOne({
    attributes: [ 'uuid' ],
    where: { id }
  });

  return user?.uuid;

};

export const getById = async (id: number) => {

  const user = await User.findOne({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;

};

export const getByUuid = async (uuid: string): Promise<User | null> => {
  const user = await User.findOne({ where: { uuid } });
  return user;
};

export const getByEmail = async (email: string): Promise<User | null> => {
  const user = await User.findOne({ where: { email } });
  return user;
};

export const getUser = async (where: Where) => {
  const user = await User.findOne({ where });
  return user;
};

export const create = async (user: User) => {

  const created = await User.create(user);
  if (!created) {
    throw new Error('Failed to create a user (null result)');
  }

  return created.toJSON();

};

export const getUsersBySearchTerm = async (limit: number, offset: number, search: string) => {
  const query = `SELECT "id", "firstName", "lastName", "uuid" FROM "User" WHERE "firstName" ILIKE '%${search}%' OR "lastName" ILIKE '%${search}%' OR "username" ILIKE '%${search}%' LIMIT ${limit} OFFSET ${offset}`;
  const matchingUsers = await sequelize.query(query, { type: QueryTypes.SELECT });
  return matchingUsers;
};

export const update = async (uuid: string, values: Values) => {
  const result = await User.update(values, { where: { uuid } });
  return getByUuid(uuid);
};
