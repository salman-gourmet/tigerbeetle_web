import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import User from '@/model/User';
import tbClient from '@/lib/tigerbeetle';
import { generateId, serializeBigInt } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        await connectMongo();
        const { userId, amount } = await req.json();

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const bankId = 999n;

        // --- CORRECTED BANK ACCOUNT STRUCTURE ---
        try {
            await tbClient.createAccounts([{
                id: bankId,
                debits_pending: 0n,
                debits_posted: 0n,
                credits_pending: 0n,
                credits_posted: 0n,
                // REMOVED: debit_account_id, credit_account_id
                user_data_128: 0n,
                user_data_64: 0n,
                user_data_32: 0,
                reserved: 0,
                ledger: 1,
                code: 1,
                flags: 0,
                timestamp: 0n
            }]);
        } catch (e) {
            // Ignore if exists
        }

        // Transfers DO have debit/credit_account_id
        const transfer = {
            id: generateId(),
            debit_account_id: bankId,
            credit_account_id: BigInt(user.tb_account_id),
            amount: BigInt(amount),
            pending_id: 0n,
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            timeout: 0,
            ledger: 1,
            code: 1,
            flags: 0,
            timestamp: 0n
        };

        const errors = await tbClient.createTransfers([transfer]);
        if (errors.length) throw new Error("Deposit Failed");

        return NextResponse.json(serializeBigInt({ message: "Deposit Successful", amount }));
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}