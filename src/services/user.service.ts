import {bind, /* inject, */ BindingScope, inject} from '@loopback/core';
import {PasswordHasher} from './utils/hash.password.bcryptjs';
import {PasswordHasherBindings} from '../keys';
import {UserRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {Credentials, User} from '../models';
import {HttpErrors} from '@loopback/rest/dist';

@bind({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}


  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findOne(
      {where: {id: foundUser.id}}
    );

    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,         // 사용자 입력
      credentialsFound.password,    // db 내 hash 값
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  // convertToUserProfile(user: User): UserProfile {
  //   // since first name and lastName are optional, no error is thrown if not provided
  //   let userName = '';
  //   if (user.firstName) userName = `${user.firstName}`;
  //   if (user.lastName)
  //     userName = user.firstName
  //       ? `${userName} ${user.lastName}`
  //       : `${user.lastName}`;
  //   const userProfile = {
  //     [securityId]: user.id,
  //     name: userName,
  //     id: user.id,
  //     roles: user.roles,
  //   };
  //
  //   return userProfile;
  // }


}
