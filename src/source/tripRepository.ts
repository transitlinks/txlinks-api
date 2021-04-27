import { getLog } from '../log';
const log = getLog('data/source/tripRepository');

import { QueryTypes, Sequelize } from 'sequelize';
import sequelize, { Where } from '../sequelize';
import Trip from '../models/Trip';
import TripCoord from '../models/TripCoord';
import User from "../models/User";


export const deleteTrip = async (where) => {
  const deleteResult = await Trip.destroy({ where });
  return deleteResult;
};

export const saveTrip = async (tripInput) => {

  const { id, uuid } = tripInput;

  if (id || uuid) {

    const query = id ? { id } : { uuid };
    const trip = await Trip.findOne({ where: query });
    if (!trip) throw new Error(`Failed to update trip. Trip ${id || uuid} not found`);

    delete tripInput.id;
    delete tripInput.uuid;
    await Trip.update(tripInput, { where: query });

    return await Trip.findOne({ where: query, include: [{ all: true }] });

  } else {

    const created = await Trip.create(tripInput);
    return await Trip.findOne({ where: { id: created.id }, include: [{ all: true }] });

  }

};

export const getTrip = async (where, options = {}) => {

  const trip = await Trip.findOne({
    where,
    include: [{ all: true }],
    ...options
  });

  return trip;

};

export const getTrips = async (where, options = {}) => {

  const trips = await Trip.findAll({
    where,
    ...options
  });

  return trips;

};

export const getLastStartedTrip = async (userId, dateTime) => {

  const query = `
      SELECT t.* FROM "Trip" t, "CheckIn" ci
      WHERE t."userId" = ${userId}
      AND t."firstCheckInId" = ci.id
      AND ci."createdAt" <= '${dateTime.toISOString()}'
      ORDER BY ci."createdAt" DESC LIMIT 1
  `;

  // AND NOT EXISTS (SELECT id FROM "CheckIn" WHERE id = t."lastCheckInId" AND "createdAt" > '${dateTime.toISOString()}')
  const results = await sequelize.query(query, { model: Trip, mapToModel: true });
  return results.length > 0 ? results[0] : null;

};

export const getTripByCheckInId = async (checkInId: number): Promise<Trip | null> => {

  let query = `SELECT * FROM "Trip" WHERE "firstCheckInId" = ${checkInId} OR "lastCheckInId" = ${checkInId}`;
  let results = await sequelize.query(query, { model: Trip, mapToModel: true });

  if (results.length > 0) return results[0];

  query = `
    SELECT t.* FROM "Trip" t, "CheckIn" fci, "CheckIn" ci, "CheckIn" lci 
    WHERE ci.id = ${checkInId} AND t."firstCheckInId" = fci.id AND t."lastCheckInId" = lci.id 
    AND ci."createdAt" BETWEEN fci."createdAt" AND lci."createdAt"
  `;

  results = await sequelize.query(query, { model: Trip, mapToModel: true });
  return results.length > 0 ? results[0] : null;

};

export const getLatestTrips = async (limit, offset, search) => {
  let query = `SELECT DISTINCT "name" as "trip", id as "tripId", uuid as "tripUuid", "lastCheckInId", MAX("createdAt") as "lastCreated" FROM "Trip"`;
  if (search) {
    query += ` WHERE "name" ILIKE '%${search}%'`
  }
  query += ` GROUP BY "name", id, uuid ORDER BY "lastCreated" DESC, "name" LIMIT ${limit} OFFSET ${offset}`;
  const latestTrips = await sequelize.query(query, { type: QueryTypes.SELECT });
  return latestTrips;
};

export const getLatestTripsByLocality = async (localityUuid, limit) => {

  let query = `
      SELECT t.uuid, t.name FROM "Trip" t, "CheckIn" fci, "CheckIn" lci
          WHERE t."firstCheckInId" = fci.id AND t."lastCheckInId" = lci.id
          AND (
              fci."localityUuid" = '${localityUuid}' OR lci."localityUuid" = '${localityUuid}'
              OR EXISTS(SELECT ci.id
              FROM "CheckIn" ci
              WHERE "localityUuid" = '${localityUuid}' AND "createdAt" BETWEEN fci."createdAt" AND lci."createdAt")
          )
          ORDER BY t."createdAt" DESC
  `;

  if (limit) query += ` LIMIT ${limit}`;

  const latestTrips = await sequelize.query(query, { type: QueryTypes.SELECT });
  return latestTrips;

};

export const getLatestTripsByCountry = async (country: string, limit: number) => {

  let query = `
      SELECT t.uuid, t.name FROM "Trip" t, "CheckIn" fci, "CheckIn" lci
          WHERE t."firstCheckInId" = fci.id AND t."lastCheckInId" = lci.id
          AND (
              fci.country = '${country}' OR lci.country = '${country}'
              OR EXISTS(SELECT ci.id
              FROM "CheckIn" ci
              WHERE country = '${country}' AND "createdAt" BETWEEN fci."createdAt" AND lci."createdAt")
          )
          ORDER BY t."createdAt" DESC
  `;

  if (limit) query += ` LIMIT ${limit}`;

  const latestTrips = await sequelize.query(query, { type: QueryTypes.SELECT });
  return latestTrips;

};

export const getTripsByCheckInIds = async (checkInIds: number[], limit: number) => {

  let query = `
      SELECT t.uuid, t.name FROM "Trip" t, "CheckIn" fci, "CheckIn" lci
          WHERE t."firstCheckInId" = fci.id AND t."lastCheckInId" = lci.id
          AND (
              fci.id IN (${checkInIds.join(',')}) OR lci.id IN (${checkInIds.join(',')})
              OR EXISTS(SELECT ci.id FROM "CheckIn" ci WHERE id IN (${checkInIds.join(',')}) AND "createdAt" BETWEEN fci."createdAt" AND lci."createdAt")
          )
          ORDER BY t."createdAt" DESC
  `;

  if (limit) query += ` LIMIT ${limit}`;

  const latestTrips = await sequelize.query(query, { type: QueryTypes.SELECT });
  return latestTrips;

};

export const deleteTripCoords = async (where: Where): Promise<number> => {
  const deleteResult = await TripCoord.destroy({ where });
  return deleteResult;
};

export const saveTripCoord = async (tripCoord: TripCoord): Promise<TripCoord | null> => {
  const created = await TripCoord.create(tripCoord);
  return await TripCoord.findOne({ where: { id: created.id }, include: [{ all: true }] });
};

export const getTripCoords = async (where: Where, options: any = {}): Promise<TripCoord[]> => {

  const tripCoords = await TripCoord.findAll({
    where,
    ...options
  });

  return tripCoords;

};

export const getLastUserTrip = async (userId: number): Promise<Trip | null> => {
  const query = `
      SELECT t.* FROM "Trip" t, "CheckIn" ci
          WHERE t."firstCheckInId" = ci.id
          ORDER BY ci."createdAt" DESC LIMIT 1
  `;
  const results = await sequelize.query(query, { model: Trip, mapToModel: true });
  return results.length > 0 ? results[0] : null;
};
