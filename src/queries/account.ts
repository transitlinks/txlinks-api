import { getLog } from '../log';
const log = getLog('queries/files');

import fs, { ReadStream } from "fs";
import path from 'path';
import stream from 'stream';
import AWS from 'aws-sdk';
import { userRepository } from "../source";


AWS.config = new AWS.Config();
AWS.config.update({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

const s3 = new AWS.S3();

const createUploadStream = (readStream: ReadStream, key: string): Promise<AWS.S3.ManagedUpload.SendData> => {

  const pass = new stream.PassThrough();
  readStream.pipe(pass);
  return s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: pass,
      ACL: 'public-read'
    })
    .promise();

};


export const uploadAvatar = async (parent, args, { user }) => {

  log.info(`graphql-request=upload-avatar user=${user ? user.uuid : null}`);

  const file = await args.file;
  const { type } = args;

  const [fileBase, fileExtension] = file.filename.split('.');

  let entityFileName = null;

  if (type === 'source') {
    entityFileName = `avatar-source.${fileExtension}`;
  } else if (type === 'scaled') {
    entityFileName = `avatar.${fileExtension}`;
  }

  log.debug(`avatar-file mime-type=${file.mimetype}`);
  if (file.mimetype.includes('image') !== -1) {

    log.info(`avatar-file avatar-file-full-path=${entityFileName}`);

    let avatarUrl = null;
    if (process.env.APP_ENV !== 'stage') {
      const entityFilePath = path.join('users', user.uuid, entityFileName);
      const result = await createUploadStream(file.createReadStream(), entityFilePath);
      avatarUrl = result.Location;
    } else {
      const { MEDIA_PATH } = process.env;
      const entityFilePath = path.join(MEDIA_PATH, 'users', user.uuid, entityFileName);
      const readableStream = file.createReadStream();
      let writeStream = fs.createWriteStream(entityFilePath);
      await readableStream.pipe(writeStream);
      avatarUrl = `/users/${user.uuid}/${entityFileName}`;
    }

    if (type === 'source') {
      await userRepository.update(user.uuid, {
        avatarSource: avatarUrl,
        avatarX: 0.5,
        avatarY: 0.5
      });
    } else if (type === 'scaled') {
      await userRepository.update(user.uuid, { avatar: avatarUrl });
    }


  }

  return (await userRepository.getByUuid(user.uuid)).json();


};
