// Supabase Edge Function: user-status-proxy
// Proxies user status checks to the XS Card backend, which in turn checks Firestore.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

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
    const url = new URL(req.url);

    const uid = url.searchParams.get('uid');
    const conferenceCode = url.searchParams.get('conferenceCode') ?? undefined;

    const xsBaseUrl =
      Deno.env.get('BASE_URL') ??
      Deno.env.get('STATUS_BASE_URL') ??
      Deno.env.get('VITE_BASE_URL') ??
      '';
    const apiKey =
      Deno.env.get('CONFERENCE_API_KEY') ??
      Deno.env.get('VITE_CONFERENCE_API_KEY') ??
      '';

    if (!uid) {
      return new Response(
        JSON.stringify({
          success: false,
          found: false,
          allowed: false,
          message: 'Missing uid parameter.',
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

    if (!xsBaseUrl || !apiKey) {
      console.error('[user-status-proxy] Missing BASE_URL/STATUS_BASE_URL or CONFERENCE_API_KEY');
      return new Response(
        JSON.stringify({
          success: false,
          found: false,
          allowed: false,
          message: 'Status service configuration missing on Edge Function.',
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

    // Delegate flag/eligibility check to XS backend (Firestore is checked there).
    const upstreamUrl = `${xsBaseUrl}/api/conference/user-status/${encodeURIComponent(uid)}`;

    const upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const text = await upstream.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text.slice(0, 200) };
    }

    if (!upstream.ok) {
      console.error('[user-status-proxy] Upstream error', upstream.status, data);
      return new Response(
        JSON.stringify({
          success: false,
          found: false,
          allowed: false,
          message: 'Upstream status service returned an error.',
          upstreamStatus: upstream.status,
          upstream: data,
        }),
        {
          status: upstream.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Normalize response shape so all callers handle one consistent contract.
    const success = Boolean((data as any).success ?? true);
    const found = Boolean((data as any).found ?? true);
    const allowed = Boolean((data as any).allowed ?? true);

    return new Response(
      JSON.stringify({
        success,
        found,
        allowed,
        conferenceCode: conferenceCode ?? (data as any).conferenceCode,
        raw: data,
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
    console.error('[user-status-proxy] Unexpected error', err);
    return new Response(
      JSON.stringify({
        success: false,
        found: false,
        allowed: false,
        message: 'Unexpected error while checking user status.',
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

