import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import User from '@/model/User';
import tbClient from '@/lib/tigerbeetle';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        await connectMongo();
        const { senderId, receiverId, amount } = await req.json();

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const transfer = {
            id: generateId(),
            debit_account_id: BigInt(sender.tb_account_id),
            credit_account_id: BigInt(receiver.tb_account_id),
            amount: BigInt(amount),
            pending_id: 0n, user_data_128: 0n, user_data_64: 0n, user_data_32: 0,
            timeout: 0, ledger: 1, code: 1, flags: 0, timestamp: 0n
        };

        const errors = await tbClient.createTransfers([transfer]);

        if (errors.length) {
            return NextResponse.json({ error: "Transfer Failed (Insufficient funds?)" }, { status: 400 });
        }

        return NextResponse.json({ message: "Transfer Successful" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}