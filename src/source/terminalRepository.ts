import { getLog } from '../log';
const log = getLog('data/source/terminalRepository');

import { QueryTypes, Sequelize } from 'sequelize';
import sequelize from '../sequelize';
import Terminal from '../models/Terminal';
import Trip from '../models/Trip';

import {
  OPEN_TRIP_QUERY_FROM,
  OPEN_TRIP_QUERY_WHERE,
  TRIP_QUERY_FROM,
  TRIP_QUERY_WHERE,
} from './queries';

const updateTerminalGeom = async (terminalId) => {
  const updateGeom = `UPDATE "Terminal" SET geom = ST_SetSRID(ST_Point(latitude, longitude), 4326) WHERE id = ${terminalId}`;
  await sequelize.query(updateGeom);
};


export const getIdByUuid = async (uuid) => {

    const terminal = await Terminal.findOne({
      attributes: [ 'id' ],
      where: { uuid }
    });

    return terminal ? terminal.id : null;

  };

export const getUuidById = async (id) => {

    const terminal = await Terminal.findOne({
      attributes: [ 'uuid' ],
      where: { id }
    });

    return terminal ? terminal.uuid : null;

  };

export const getTerminal = async (where, options) => {

    let terminal = await Terminal.findOne({
      where,
      include: [ { all: true } ],
      ...options
    });

    return terminal;

  };

export const getTerminals = async (where, options) => {

    let terminals = await Terminal.findAll({
      where,
      include: [ { all: true } ],
      ...options
    });

    return terminals;

  };

  /*
  getRoute = async (from, to, params) => {

    let costExpression = 'distance';
    if (params) {
      const { transportTypes } = params;
      if (transportTypes) {
        costExpression = `(distance / (1 + ((transport IN (${transportTypes.map(t => `''${t}''`).join(',')}))::integer * 999)))`;
      }
    }

    const query = `
      SELECT x.path_id, x.path_seq, x.cost, t.*,
        CASE
           WHEN edge = -1 THEN agg_cost ELSE NULL END AS "total_cost"
        FROM
            pgr_ksp(
                    'SELECT id, source, target, ${costExpression} AS cost FROM "Connection"',
                    (SELECT id FROM "Locality" WHERE uuid = '${from}'),
                    (SELECT id FROM "Locality" WHERE uuid = '${to}'),
                    5,
                    directed := TRUE
                ) as x
                LEFT JOIN "Connection" AS c ON x.edge = c.id
                LEFT JOIN "Terminal" AS t ON t."id" = c."sourceTerminalId"
        ORDER BY
            x.path_id, x.path_seq;
    `;

    console.log('ROUTE QUERY', query);
    const departures = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    let routes = {};
    for (let i = 0; i < departures.length; i++) {
      if (departures[i].linkedTerminalId) {
        departures[i].linkedTerminal = await terminalRepository.getTerminal({ id: departures[i].linkedTerminalId });
        departures[i].checkIn = await checkInRepository.getCheckIn({ id: departures[i].checkInId });
        if (!routes[departures[i].path_id]) routes[departures[i].path_id] = { cost: 0, departures: [] };
        routes[departures[i].path_id].departures.push(departures[i]);
        routes[departures[i].path_id].cost += Math.round(departures[i].cost);
      }
    }

    const sortedRoutes = {};
    const routeCosts = Object.keys(routes).map(pathId => routes[pathId].cost).sort((a, b) => a - b);
    for (let i = 0; i < routeCosts.length; i++) {
      sortedRoutes[`${i + 1}`] = routes[Object.keys(routes).find(pathId => routes[pathId].cost === routeCosts[i])].departures;
    }

    return sortedRoutes;

  },
   */

export const getInternalDeparturesByLocality = async (localityUuid, query = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $eq: Sequelize.col('Terminal.localityUuid') },
        localityUuid,
        type: 'departure',
        ...query
      },
      include: [{ all: true }]
    });

    return terminals;

  };

export const getLinkedLocalitiesByLocality = async (query = {}) => {

    const linkedLocalities = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $ne: Sequelize.col('Terminal.localityUuid') },
        ...query
      },
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('linkedLocalityUuid')), 'linkedLocalityUuid'],
        'linkedLocality'
      ],
      group: ['Terminal.linkedLocalityUuid', 'Terminal.linkedLocality'],
      raw: true
    });

    return linkedLocalities;

  };

export const countInterTerminals = async (query = {}) => {

    const counts = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $ne: Sequelize.col('Terminal.localityUuid') },
        ...query
      },
      attributes: ['type', [Sequelize.fn('count', Sequelize.col('type')), 'count']],
      group: ['Terminal.type'],
      raw: true,
      order: Sequelize.literal('count DESC')
    });

    const terminalCounts = {
    };

    for (let i = 0; i < counts.length; i++) {
      terminalCounts[counts[i].type] = counts[i].get('count');
    }

    return terminalCounts;

  };


export const getInterTerminalsByLocality = async (localityUuid, query = {}, options = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $ne: Sequelize.col('Terminal.localityUuid') },
        linkedTerminalId: { $ne: null },
        localityUuid,
        ...query
      },
      include: [{ all: true }],
      ...options
    });

    return terminals;

  };

  /*
  getInterTerminalsByTag = async (tag, userId) => {

    const checkIns = await CheckIn.findAll({
      where: {
        tag: { $ne: sequelize.col('Terminal.locality') },
        locality
      },
      include: [{ all: true }]
    });

    return terminals;

  },
   */

export const getTerminalCountByTag = async (tag) => {
    const query = `SELECT COUNT(t."id") FROM "Terminal" trm, "CheckIn" ci, "EntityTag" et, "Tag" t WHERE et."tagId"= t.id AND ci."id" = et."checkInId" AND trm."checkInId" = ci."id" AND t."value" = '${tag}'`;
    const [results, number] = await sequelize.query(query, { type: QueryTypes.SELECT });
    if (number === 1) {
      return results[0].count;
    } else {
      return -1;
    }
  };

export const getTerminalCountByTrip = async (tripId, open) => {

    const query = `SELECT COUNT(term.id)
      ${open ? OPEN_TRIP_QUERY_FROM : TRIP_QUERY_FROM}, "Terminal" term
      WHERE t.id = ${tripId}
      ${open ? OPEN_TRIP_QUERY_WHERE : TRIP_QUERY_WHERE}
      AND term."checkInId" = ci.id AND term."linkedTerminalId" IS NOT NULL AND term."type" = 'departure';
    `;

    const [results, number] = await sequelize.query(query, { type: QueryTypes.SELECT });
    if (number === 1) {
      return results[0].count;
    }

    return -1;

  };

export const getTerminalCountByLocality = async (localityUuid) => {
    const query = `SELECT count(id) FROM "Terminal" WHERE "localityUuid" = '${localityUuid}' AND "linkedLocalityUuid" != "localityUuid"`;
    const [results, number] = await sequelize.query(query, { type: QueryTypes.SELECT });
    if (number === 1) {
      return results[0].count;
    } else {
      return -1;
    }
  };

export const getTerminalCountByCountry = async (country) => {
    const query = `SELECT count(id) FROM "Terminal" WHERE "country" = '${country}' AND "linkedLocality" != "locality"`;
    const [results, number] = await sequelize.query(query, { type: QueryTypes.SELECT });
    if (number === 1) {
      return results[0].count;
    } else {
      return -1;
    }
  };

export const saveTerminal = async (terminal) => {

    if (terminal.uuid || terminal.id) {

      const [length, saved] = await Terminal.update(terminal, {
        where: terminal.uuid ? { uuid: terminal.uuid } : { id: terminal.id }
      });

      if (length !== 1) {
        throw new Error(`Invalid terminal update result: ${length}`);
      }

      const updated = await Terminal.findOne({
        where: terminal.uuid ? { uuid: terminal.uuid } : { id: terminal.id },
        include: [{ all: true }]
      });

      await updateTerminalGeom(updated.id);
      return updated;

    }

    let created = await Terminal.create(terminal);

    if (!created) {
      throw new Error('Failed to create a terminal (null result)');
    }

    await updateTerminalGeom(created.id);
    created = await Terminal.findOne({ where: { id: created.id }, include: [{ all: true }] });
    return created;

  };

export const updateTerminals = async (where, values, options = {}) => {
    const [length, saved] = await Terminal.update(values, { where, ...options });
    return length;
  };

export const deleteTerminal = async (uuid) => {

    const terminal = await Terminal.findOne({ where: { uuid }});

    if (!terminal) {
      throw new Error('Could not find terminal with uuid ' + uuid);
    }

    await terminal.destroy();
    return terminal;

  };

export const saveConnection = async (sourceTerminalId, targetTerminalId, distance) => {

    const existingConnections = await sequelize.query(
      `SELECT id FROM "Connection" 
                WHERE "sourceTerminalId" = ${sourceTerminalId}
                AND "targetTerminalId" = ${targetTerminalId}`
    );

    const fields = {
      '"sourceLocality"': 't."localityUuid"',
      '"targetLocality"': 'lt."localityUuid"',
      '"sourceFormattedAddress"': 't."formattedAddress"',
      '"targetFormattedAddress"': 'lt."formattedAddress"',
      '"transport"': 't."transport"',
      'geom': 'ST_MakeLine(t.geom, lt.geom)::GEOMETRY(LineString,4326)',
      'distance': distance || 'ST_Distance(t.geom::GEOGRAPHY, lt.geom::GEOGRAPHY)/1000',
      'source': 'tl.id',
      'target': 'ltl.id',
      '"sourceTerminalId"': 't.id',
      '"targetTerminalId"': 'lt.id'
    };


    const updateStatement = `
      UPDATE "Connection" SET ${Object.keys(fields).map(field => `${field} = ${fields[field]}`).join(', ')}
      FROM "Terminal" t, "Terminal" lt, "Locality" tl, "Locality" ltl
      WHERE 
        "sourceTerminalId" = ${sourceTerminalId} AND
        "targetTerminalId" = ${targetTerminalId} AND
        t.id = "sourceTerminalId" AND
        lt.id = "targetTerminalId" AND
        lt.id = t."linkedTerminalId" AND
        t."localityUuid" = tl.uuid::varchar AND
        lt."localityUuid" = ltl.uuid::varchar
    `;

    const insertStatement = `
      INSERT INTO "Connection" (${Object.keys(fields).join(', ')})
        SELECT ${Object.keys(fields).map(field => `${fields[field]} AS ${field}`).join(', ')}
        FROM "Terminal" t, "Terminal" lt, "Locality" tl, "Locality" ltl
        WHERE
            t.id = ${sourceTerminalId} AND 
            t."linkedTerminalId" = lt.id AND 
            t."localityUuid" = tl.uuid::varchar AND 
            lt."localityUuid" = ltl.uuid::varchar 
    `;

    const query = existingConnections[0].length > 0 ? updateStatement : insertStatement;
    await sequelize.query(query);

  };

export const deleteConnection = async ({ sourceTerminalId, targetTerminalId }, andOr) => {
    const params: { sourceTerminalId?: number, targetTerminalId?: number } = {};
    if (sourceTerminalId) params.sourceTerminalId = sourceTerminalId;
    if (targetTerminalId) params.targetTerminalId = targetTerminalId;
    const fields = Object.keys(params);
    const where = fields.map(field => `"${field}" = ${params[field]}`).join(` ${andOr} `);
    await sequelize.query(`DELETE FROM "Connection" WHERE ${where}`);
  };

export const getRoutePoints = async (terminal) => {

    const linkedTerminal = terminal.linkedTerminalId ?
      await Terminal.findOne({ where: { id: terminal.linkedTerminalId } }) :
      null;

    if (linkedTerminal) {
      const departure = terminal.type === 'departure' ? terminal : linkedTerminal;
      const arrival = terminal.type === 'arrival' ? terminal : linkedTerminal;
      const query = `
        SELECT latitude, longitude, locality, "createdAt" FROM "CheckIn" ci
          WHERE "userId" = ${terminal.userId}
          AND "createdAt" BETWEEN '${departure.createdAt.toISOString()}' AND '${arrival.createdAt.toISOString()}'
          AND NOT EXISTS (SELECT id FROM "Terminal" WHERE "checkInId" = ci.id)
          AND id NOT IN (${departure.checkInId}, ${arrival.checkInId})
          ORDER BY "createdAt" ASC
        `;
      const routePoints = await sequelize.query(query, { type: QueryTypes.SELECT });
      return routePoints;
    }

    return [];

  };

export const getTotalDistance = async (route) => {

    const distances = [];

    for (let i = 0; i < route.length - 1; i++) {
      const point = route[i];
      const nextPoint = route[i + 1];
      const query = `
        SELECT ST_Distance(ST_SetSRID(ST_Point(${point.latitude}, ${point.longitude}), 4326)::GEOGRAPHY, ST_SetSRID(ST_Point(${nextPoint.latitude}, ${nextPoint.longitude}), 4326)::GEOGRAPHY)/1000 AS distance
      `;
      const [results, number] = await sequelize.query(query, { type: QueryTypes.SELECT });
      if (number > 0) distances.push(results[0].distance);
    }

    let totalDistance = 0;

    for (let i = 0; i < distances.length; i++) {
      totalDistance += distances[i];
    }

    return totalDistance;

  };

export const getDepartureBefore = async (dateTime, userId, checkIn) => {

    const query: { userId?: number; checkInId?: any; createdAt: any } = { createdAt: { $lte: dateTime } };
    if (userId) query.userId = userId;
    if (checkIn) query.checkInId = { $ne: checkIn.id };

    const terminal = await Terminal.findOne({
      where: Sequelize.and(query),
      order: [[ 'createdAt', 'DESC' ]],
      include: {
        all: true
      }
    });

    return (terminal && terminal.type === 'departure') ? terminal : null;

  };

export const getArrivalAfter = async (dateTime, userId, checkIn) => {
    const query: {
      userId: number;
      checkInId?: any;
      createdAt: any;
    } = {
      createdAt: { $gt: dateTime },
      userId,
    };

    if (checkIn) query.checkInId = { $ne: checkIn.id };

    const terminal = await Terminal.findOne({
      where: Sequelize.and(query),
      order: [[ 'createdAt', 'ASC' ]],
      include: {
        all: true
      }
    });

    return (terminal && terminal.type === 'arrival') ? terminal : null;

  };

export const getTerminalsBetween = async (departureDateTime, arrivalDateTime, userId, terminal, linkedTerminal) => {

    const terminalId = terminal ? terminal.id : null;
    const linkedTerminalId = linkedTerminal ? linkedTerminal.id : null;

    let query = `
        SELECT * FROM "Terminal" 
        WHERE "createdAt" > '${departureDateTime.toISOString()}'
        AND "createdAt" < '${arrivalDateTime.toISOString()}'
        AND "userId" = ${userId}`;

    if (terminalId) query += ` AND id != ${terminalId}`;
    if (linkedTerminalId) query += ` AND id != ${linkedTerminalId}`;

    return await sequelize.query(query, { model: Terminal, mapToModel: true });

  };

export const setLocalityAdminLevel = async (locality, country, adminArea1, adminArea2) => {

    let where = '';
    if (adminArea1) where += ` AND loc."country" = '${country}'`;
    if (adminArea2) where += ` AND loc."adminArea1" = '${adminArea1}'`;

    const localityQuery = `
        UPDATE "Terminal" t SET "localityLong" = loc."nameLong"
          FROM "Locality" loc
          WHERE t.locality = '${locality}'
            ${where}
            AND loc.uuid = t."localityUuid"::uuid;
    `;

    const linkedLocalityQuery = `
        UPDATE "Terminal" t SET "linkedLocalityLong" = loc."nameLong"
          FROM "Locality" loc
          WHERE t."linkedLocality" = '${locality}'
            ${where}
            AND loc.uuid = t."linkedLocalityUuid"::uuid;
    `;

    console.log('terminal admin lvl', localityQuery);
    console.log('lnkd terminal admin lvl', linkedLocalityQuery);

    await sequelize.query(localityQuery);
    await sequelize.query(linkedLocalityQuery);

  };

export const getTripDepartures = async (userId: number, tripId: number, checkInId?: number) => {

  let query = `
      SELECT t.* FROM "Terminal" t, "Trip" trip, "CheckIn" fc
      WHERE trip.id = ${tripId}
      AND fc.id = trip."firstCheckInId"
      AND t."createdAt" > fc."createdAt"
      AND t."type" = 'departure'
      AND t."priceType" = 'payment'
      AND t."userId" = ${userId}`;

  return await sequelize.query(query, { model: Terminal, mapToModel: true });

};
