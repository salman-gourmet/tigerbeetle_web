export const serializeBigInt = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
    ));
};

export const generateId = (): bigint => BigInt(Math.floor(Math.random() * 10000000000));