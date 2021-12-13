import { DateTime } from 'luxon';
import { FlipType } from '../interfaces';

export const readableTimeUntilExpiration = (flip: FlipType) => {
    return DateTime.fromMillis(expiration(flip))
            .diff(DateTime.now().toUTC())
            .toFormat("hh'h' mm'm' ss's'");
};

export const readableTimeUntilRetrieval = (flip: FlipType) => {
    return DateTime.fromMillis(retrieval(flip))
            .diff(DateTime.now().toUTC())
            .toFormat("hh'h' mm'm' ss's'");
};

export const isExpired = (timeUntil: number) => {
    return timeUntil <= 0;
};

export const expiration = (flip: FlipType) => {
    // return (parseInt(proposition.createdAt) + parseInt(proposition.expiry) + 3600) * 1000;
    return (flip.timestamp + 3600 + 3600) * 1000;
};

export const retrieval = (flip: FlipType) => {
    // 3600 1 hour
    return (flip.timestamp + 3600) * 1000;
};

export const timeUntilExpiration = (flip: any) => {
    const exp = expiration(flip);
    return DateTime.fromMillis(exp + 3600)
        .diff(DateTime.now().toUTC()).toMillis();
};

export const timeUntilRetrieval = (flip: any) => {
    const exp = retrieval(flip);
    return DateTime.fromMillis(exp)
        .diff(DateTime.now().toUTC()).toMillis();
};
