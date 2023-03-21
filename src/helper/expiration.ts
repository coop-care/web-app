
export const expirationDate = !!process.env.BETA_EXPIRATION && !Number.isNaN((new Date(process.env.BETA_EXPIRATION)).getTime())
    ? new Date(process.env.BETA_EXPIRATION)
    : undefined;

export const didExpire =() => !!expirationDate && expirationDate < new Date();
