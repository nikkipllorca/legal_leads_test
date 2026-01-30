import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function GET() {
    try {
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*');

        if (error) throw error;
        return NextResponse.json(profiles);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId, role } = await request.json();

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { email, password, role } = await request.json();

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role }
        });

        if (error) throw error;

        // Trigger should handle profile creation, but we ensure role is correct
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role })
            .eq('id', data.user.id);

        if (profileError) throw profileError;

        return NextResponse.json({ success: true, user: data.user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
