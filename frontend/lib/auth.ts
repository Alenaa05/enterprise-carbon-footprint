/**
 * auth.ts — Frontend Cognito auth helpers
 *
 * Uses the ID token because:
 * - It contains the `sub` claim many backends use as userId
 * - Cognito authorizers can accept it
 *
 * Token is stored in sessionStorage["idToken"].
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { COGNITO } from "./cognito";

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO.userPoolId,
  ClientId: COGNITO.clientId,
});

const TOKEN_KEY = "idToken";

export function login(email: string, password: string): Promise<string> {
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const idToken = session.getIdToken().getJwtToken();
        sessionStorage.setItem(TOKEN_KEY, idToken);
        resolve(idToken);
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error("NEW_PASSWORD_REQUIRED")),
    });
  });
}

export function getSession(): Promise<string | null> {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session?.isValid()) {
          sessionStorage.removeItem(TOKEN_KEY);
          resolve(null);
          return;
        }

        const idToken = session.getIdToken().getJwtToken();
        sessionStorage.setItem(TOKEN_KEY, idToken);
        resolve(idToken);
      },
    );
  });
}

export function logout(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  userPool.getCurrentUser()?.signOut();
}

export function isLoggedIn(): boolean {
  return !!sessionStorage.getItem(TOKEN_KEY);
}