// Supabase Edge Function: checkin-attendee
// Confirms registration via user-status-proxy, then marks checked_in in registrations (Option A).

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type CheckinRequestBody = {
  uid: string;
  conferenceCode: string;
  email?: string;
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
    const functionsBaseUrl =
      Deno.env.get('SUPABASE_EDGE_FUNCTIONS_BASE_URL') ??
      Deno.env.get('SUPABASE_FUNCTIONS_BASE_URL') ??
      '';

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

    const { uid, conferenceCode, email } = body;

    // Call user-status-proxy to confirm eligibility
    const statusUrl = functionsBaseUrl
      ? `${functionsBaseUrl}/user-status-proxy?uid=${encodeURIComponent(uid)}&conferenceCode=${encodeURIComponent(
          conferenceCode,
        )}`
      : undefined;

    if (!statusUrl) {
      console.error('[checkin-attendee] SUPABASE_FUNCTIONS_BASE_URL not configured.');
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'config_error',
          message: 'Status proxy base URL not configured.',
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

    // Gate check-in by asking XS if this user is valid for the conference.
    const statusRes = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let statusData: any = {};
    try {
      statusData = await statusRes.json();
    } catch {
      statusData = {};
    }

    const success = Boolean(statusData.success);
    const found = Boolean(statusData.found);
    const allowed = Boolean(statusData.allowed);

    if (!success || !found) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'not_registered',
          message: 'User is not registered for this conference.',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (!allowed) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'not_allowed',
          message: 'User is not allowed for this conference.',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // At this point the user is confirmed as registered & allowed.
    // Mark them as checked in (Option A).

    // Try to find by xs_user_id first, then fallback to email + conference_code
    let registrationId: string | null = null;

    if (uid) {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('xs_user_id', uid)
        .eq('conference_code', conferenceCode)
        .maybeSingle();

      if (error) {
        console.error('[checkin-attendee] Lookup by xs_user_id failed', error);
      } else if (data) {
        registrationId = (data as any).id ?? null;
      }
    }

    if (!registrationId && email) {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('conference_code', conferenceCode)
        .ilike('email', email)
        .maybeSingle();

      if (error) {
        console.error('[checkin-attendee] Lookup by email failed', error);
      } else if (data) {
        registrationId = (data as any).id ?? null;
      }
    }

    if (!registrationId) {
      console.warn('[checkin-attendee] No matching registration found in Supabase for check-in');
      return new Response(
        JSON.stringify({
          ok: false,
          reason: 'registration_not_found',
          message:
            'User is allowed by XS, but no matching registration record was found in Supabase for check-in.',
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

    // Option A: update check-in state directly on registrations table.
    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

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
        message: 'Delegate checked in successfully.',
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

