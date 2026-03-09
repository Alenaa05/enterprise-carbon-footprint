export const getUserId = (event: any) => {
  return event?.requestContext?.authorizer?.claims?.sub || "anonymous";
};

export const getOrganizationId = (event: any) => {
  return (
    event?.requestContext?.authorizer?.claims?.["custom:organization"] || null
  );
};
