import { getLog } from '../log';
const log = getLog('queries/files');

import fs from "fs";
import path from 'path';
import { userRepository } from "../source";

export const uploadAvatar = async (parent, args, { user }) => {

  log.info(`graphql-request=upload-avatar user=${user ? user.uuid : null}`);

  const file = await args.file;
  const { type } = args;

  const { MEDIA_PATH } = process.env;
  const [fileBase, fileExtension] = file.filename.split('.');

  const mediaPath = path.join(MEDIA_PATH, 'users', user.uuid);

  let entityFileName = null;

  if (type === 'source') {
    entityFileName = `avatar-source.${fileExtension}`;
  } else if (type === 'scaled') {
    entityFileName = `avatar.${fileExtension}`;
  }

  const entityFilePath = path.join(mediaPath, entityFileName);

  log.debug(`avatar-file mime-type=${file.mimetype}`);
  if (file.mimetype.includes('image') !== -1) {

    log.info(`avatar-file avatar-file-full-path=${entityFileName}`);

    const readableStream = file.createReadStream();
    let writeStream = fs.createWriteStream(entityFilePath);

    await readableStream.pipe(writeStream);

    const mediaUrl = `/users/${user.uuid}/${entityFileName}`;
    if (type === 'source') {
      await userRepository.update(user.uuid, {
        avatarSource: mediaUrl,
        avatarX: 0.5,
        avatarY: 0.5
      });
    } else if (type === 'scaled') {
      await userRepository.update(user.uuid, { avatar: mediaUrl });
    }

  }

  return (await userRepository.getByUuid(user.uuid)).json();


};
