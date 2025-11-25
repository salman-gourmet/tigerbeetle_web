import { createClient } from 'tigerbeetle-node';

const tbClient = createClient({
    cluster_id: 0n,
    replica_addresses: ['3000']
});

export default tbClient;