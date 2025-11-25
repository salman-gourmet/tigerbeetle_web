import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import User from '@/model/User';
import tbClient from '@/lib/tigerbeetle';
import { serializeBigInt } from '@/lib/utils';

// We use { params } to get the dynamic ID from the URL
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        // 1. Find Mongo User
        // We must await params in Next.js 15+, but in 14 it's direct. 
        // Safest access for now:
        const { id } = await params;
        console.log("params", params)

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const tbId = BigInt(user.tb_account_id);

        // 2. Get Balance from TigerBeetle
        const accounts = await tbClient.lookupAccounts([tbId]);
        const account = accounts[0];

        let balanceData = {
            balance: "0",
            credits: "0",
            debits: "0"
        };

        if (account) {
            const balance = account.credits_posted - account.debits_posted;
            balanceData = {
                balance: balance.toString(),
                credits: account.credits_posted.toString(),
                debits: account.debits_posted.toString()
            };
        }

        // 3. Get Recent Transfers (History)
        const transfers = await tbClient.getAccountTransfers({
            account_id: tbId,
            timestamp_min: 0n,
            timestamp_max: 0n,
            limit: 10,
            flags: 1, // 2 = Incoming and Outgoing transfers
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            code: 0
        });

        const deposit = await tbClient.getAccountTransfers({
            account_id: tbId,
            timestamp_min: 0n,
            timestamp_max: 0n,
            limit: 10,
            flags: 2, // 2 = Incoming and Outgoing transfers
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            code: 0
        });

        // 4. Return Data (using helper to handle BigInt serialization)
        return NextResponse.json(serializeBigInt({
            user: user,
            financials: balanceData,
            history: [...transfers, ...deposit]
        }));

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}