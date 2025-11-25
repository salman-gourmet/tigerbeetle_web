import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import User from '@/model/User';
import tbClient from '@/lib/tigerbeetle';
import { generateId, serializeBigInt } from '@/lib/utils';

// GET: List Users
export async function GET() {
    try {
        await connectMongo();
        const users = await User.find({}, 'username email tb_account_id');
        return NextResponse.json(serializeBigInt(users));
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Create User
export async function POST(req: NextRequest) {
    try {
        await connectMongo();
        const body = await req.json();
        const { username, email } = body;

        const accountId = generateId();

        // --- CORRECTED ACCOUNT STRUCTURE ---
        const account = {
            id: accountId,
            debits_pending: 0n,
            debits_posted: 0n,
            credits_pending: 0n,
            credits_posted: 0n,
            // REMOVED: debit_account_id, credit_account_id (These belong to Transfers!)
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            reserved: 0,
            ledger: 1,
            code: 1,
            flags: 0,
            timestamp: 0n
        };

        const errors = await tbClient.createAccounts([account]);
        if (errors.length) throw new Error("TigerBeetle Creation Failed");

        const newUser = await User.create({
            username,
            email,
            tb_account_id: accountId.toString()
        });

        return NextResponse.json(serializeBigInt({ message: "User created", user: newUser }));
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}