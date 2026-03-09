import AWS from "aws-sdk";

const client = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const createUser = async (
  userPoolId: string,
  username: string,
  attributes: { Name: string; Value: string }[],
) => {
  const params: AWS.CognitoIdentityServiceProvider.AdminCreateUserRequest = {
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes:
      attributes as AWS.CognitoIdentityServiceProvider.AttributeType[],
  };
  return client.adminCreateUser(params).promise();
};

export const getUser = async (userPoolId: string, username: string) => {
  const params: AWS.CognitoIdentityServiceProvider.AdminGetUserRequest = {
    UserPoolId: userPoolId,
    Username: username,
  };
  return client.adminGetUser(params).promise();
};

export const cognitoClient = client;
