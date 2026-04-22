// Supabase Edge Function: checkin-attendee
// Checks registration state in Supabase and returns explicit reason codes.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type CheckinRequestBody = {
  uid: string;
  conferenceCode: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight for browser clients
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[checkin-attendee] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'config_error',
          message: 'Supabase service configuration missing on Edge Function.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = (await req.json().catch(() => null)) as CheckinRequestBody | null;

    if (!body || !body.uid || !body.conferenceCode) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'invalid_request',
          message: 'Missing uid or conferenceCode.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const { uid, conferenceCode } = body;
    const { data: registration, error: lookupError } = await supabase
      .from('registrations')
      .select('id, first_name, last_name, email_verified, checked_in')
      .eq('xs_user_id', uid)
      .eq('conference_code', conferenceCode)
      .maybeSingle();

    if (lookupError) {
      console.error('[checkin-attendee] Lookup by xs_user_id failed', lookupError);
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'unexpected_error',
          message: 'Failed to lookup delegate registration.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (!registration) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'not_registered',
          message: 'This QR is not registered.',
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const attendeeName = `${(registration as any).first_name ?? ''} ${(registration as any).last_name ?? ''}`
      .trim();
    const checkedIn = Boolean((registration as any).checked_in);
    const emailVerified = Boolean((registration as any).email_verified);

    if (!emailVerified) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'email_not_verified',
          message: 'Delegate email is not verified yet.',
          name: attendeeName || 'User Found',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (checkedIn) {
      return new Response(
        JSON.stringify({
          ok: true,
          reason: 'already_checked_in',
          message: 'Delegate is already checked in.',
          name: attendeeName || 'User Found',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', (registration as any).id);

    if (updateError) {
      console.error('[checkin-attendee] Failed to update check-in state', updateError);
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'update_failed',
          message: 'Failed to mark delegate as checked in.',
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reason: 'checked_in',
        message: 'Delegate checked in successfully.',
        name: attendeeName || 'User Found',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err) {
    console.error('[checkin-attendee] Unexpected error', err);
    return new Response(
      JSON.stringify({
        ok: false,
        reason: 'unexpected_error',
        message: 'Unexpected error while checking in delegate.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});

