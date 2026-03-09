import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

import { cognitoConfig } from "./cognito";

const poolData = {
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
};

export const userPool = new CognitoUserPool(poolData);

export function login(email: string, password: string) {
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise<string>((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result.getIdToken().getJwtToken());
      },
      onFailure: (err) => reject(err),
    });
  });
}
