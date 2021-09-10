import { DateTime } from 'luxon';

export const readableTimeUntilExpiration = (proposition: any) => {
    return DateTime.fromMillis(expiration(proposition))
            .diff(DateTime.now().toUTC())
            .toFormat("hh'h' mm'm' ss's'");
};

export const readableTimeUntilRetrieval = (proposition: any) => {
    return DateTime.fromMillis(retrieval(proposition))
            .diff(DateTime.now().toUTC())
            .toFormat("hh'h' mm'm' ss's'");
};

export const isExpired = (timeUntil: number) => {
    return timeUntil <= 0;
};

export const expiration = (proposition: any) => {
    return (parseInt(proposition.createdAt) + parseInt(proposition.expiry) + 3600) * 1000;
};

export const retrieval = (proposition: any) => {
    // 3600 1 hour
    return (parseInt(proposition.createdAt) + parseInt(proposition.expiry)) * 1000;
};

export const timeUntilExpiration = (proposition: any) => {
    const exp = expiration(proposition);
    return DateTime.fromMillis(exp + 3600)
        .diff(DateTime.now().toUTC()).toMillis();
};

export const timeUntilRetrieval = (proposition: any) => {
    const exp = retrieval(proposition);
    return DateTime.fromMillis(exp)
        .diff(DateTime.now().toUTC()).toMillis();
};
