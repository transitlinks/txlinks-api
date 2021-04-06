import { getLog } from '../log';
const log = getLog('queries/user');

import bcrypt from 'bcrypt-nodejs';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import nodemailer from 'nodemailer';
import { ApolloError } from 'apollo-server-errors';
import { userRepository } from '../source';

export const getUser = async (_: any, { uuid }: any, context: any) => {
  try {
    if (context.user) {
      const user = await userRepository.getByUuid(context.user.uuid);
      console.log('returning user', user?.json());
      return user?.json();
    }
    return null;
  } catch (error) {
    throw new ApolloError(error);
  }
};

export const checkPasswordResetCode = async (_: any, { code }: any) => {

  log.info(`graphql-request=check-pwd-reset-code code=${code}`);

  const user = await userRepository.getUser({ resetPasswordCode: code });
  return user?.email;

};

export const updateUser = async (_: any, { uuid, values }: any) => {

  const { password, email } = values;

  if (password && password.length > 0) {
    values.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  if (email && email.length > 0) {
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser && existingUser.email !== email) throw new ApolloError('Another user with this e-mail exists.');
  }


  let user = await userRepository.update(uuid, values);
  if (!user) throw new ApolloError(`Unable to update user ${uuid}. User not found`);

  if (user.logins === 1) user = await userRepository.update(uuid, { logins: 2 });
  return user!.json();

};

export const requestPasswordReset = async (_: any, { email }: any) => {

  log.info(`graphql-request=request-password-reset email=${email}`);

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (email) {

    let user = await userRepository.getUser({ email });
    if (user) {

      user = await userRepository.update(user.uuid, { resetPasswordCode: uuidv4() });

      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: SMTP_USER || testAccount.user, // generated ethereal user
          pass: SMTP_PASSWORD || testAccount.pass, // generated ethereal password
        },
      });

      const resetUrl = `https://transitlinks.net/reset-password/${user!.resetPasswordCode}`;
      let result = await transporter.sendMail({
        from: '"Transitlinks Support" <no-reply@transitlinks.net>',
        to: email,
        subject: 'Transitlinks - Reset password',
        text: `You can now follow this link to reset your password: ${resetUrl}`,
        html: `<span>You can now follow this link to reset your password:</span>&nbsp;<a href="${resetUrl}">${resetUrl}</a>"`,
      });

      log.info(`graphql-request=request-reset-password messageId=${result ? result.messageId : null}`);

      if (result.messageId) return email;

      return 'ERROR'

    }

  }

  return 'ERROR';

};

export const resetPassword = async (_: any, { code, password }: any) => {

  log.info(`graphql-request=reset-password code=${code}`);

  if (code && password && password.length > 0) {
    let user = await userRepository.getUser({ resetPasswordCode: code });
    if (user) {
      const encryptedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      user = await userRepository.update(user.uuid, { password: encryptedPassword, resetPasswordCode: null });
      return user!.email;
    }
  }

  return 'ERROR';

};
