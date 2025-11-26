import { createClient } from 'tigerbeetle-node';

const tbClient = createClient({
    cluster_id: 0n,
    replica_addresses: ['192.168.2.189:3001']
});

export default tbClient;