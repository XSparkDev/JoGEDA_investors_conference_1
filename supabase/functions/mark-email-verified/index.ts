// Supabase Edge Function: mark-email-verified
// Proxies admin email verification to XS API using server-side ADMIN_API_KEY.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const xsBaseUrl =
      Deno.env.get('BASE_URL') ??
      Deno.env.get('VITE_BASE_URL') ??
      '';
    const adminApiKey =
      Deno.env.get('ADMIN_API_KEY') ??
      '';

    if (!xsBaseUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'XS base URL is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminApiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Admin auth not configured (ADMIN_API_KEY missing)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = (await req.json().catch(() => null)) as { email?: string; conferenceCode?: string } | null;
    const email = body?.email?.trim();
    const conferenceCode = body?.conferenceCode?.trim();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'email is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const upstreamRes = await fetch(`${xsBaseUrl}/admin/mark-email-verified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminApiKey}`,
      },
      body: JSON.stringify({ email }),
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    let upstreamBody: any = {};
    if (contentType.includes('application/json')) {
      upstreamBody = await upstreamRes.json().catch(() => ({}));
    } else {
      const text = await upstreamRes.text().catch(() => '');
      upstreamBody = { message: text || 'Unexpected upstream response.' };
    }

    if (!upstreamRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: upstreamBody?.message || 'Verify request failed.',
          upstreamStatus: upstreamRes.status,
        }),
        {
          status: upstreamRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Supabase service configuration missing on Edge Function.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let updateQuery = supabase
      .from('registrations')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .ilike('email', email);

    if (conferenceCode) {
      updateQuery = updateQuery.eq('conference_code', conferenceCode);
    }

    const { error: updateError } = await updateQuery;
    if (updateError) {
      console.error('[mark-email-verified] Failed to update registration email_verified flag', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email verified upstream, but failed to persist verification state in Supabase.',
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: Boolean(upstreamBody?.success ?? true),
        message: upstreamBody?.message || 'Email marked as verified',
        uid: upstreamBody?.uid ?? null,
        email: upstreamBody?.email ?? email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[mark-email-verified] unexpected error', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Unexpected verify error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

