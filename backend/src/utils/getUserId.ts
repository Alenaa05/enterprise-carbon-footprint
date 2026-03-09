export const getUserId = (event: any) => {
  return event?.requestContext?.authorizer?.claims?.sub || "anonymous";
};
