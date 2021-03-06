import { getLog } from '../log';
import { userRepository, checkInRepository, terminalRepository, tripRepository } from "../source";
const log = getLog('queries/terminals');

export const getUserDepartures = async (parent, args, { user }) => {

  const { checkInUuid } = args;

  log.debug(`graphql-request=get-user-departures check-in=${checkInUuid} user=${user ? user.uuid : null}`);

  if (!user) return [];

  const userId = await userRepository.getUserIdByUuid(user.uuid);

  let trip = await tripRepository.getLastStartedTrip(userId, new Date());
  if ((!trip || trip.lastCheckInId) && checkInUuid) {
    const checkInId = await checkInRepository.getCheckInIdByUuid(checkInUuid);
    trip = await tripRepository.getTripByCheckInId(checkInId);
  }

  let terminals = [];
  if (trip) terminals = await terminalRepository.getTripDepartures(userId, trip.id);

  return terminals.map(terminal => terminal.json());

};
