// Supabase Edge Function: list-attendees
// Returns conference attendees and their check-in status from Supabase.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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
      console.error('[list-attendees] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({
          ok: false,
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

    const url = new URL(req.url);
    const conferenceCode = url.searchParams.get('conferenceCode');
    const search = url.searchParams.get('search') ?? '';

    if (!conferenceCode) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'Missing conferenceCode parameter.',
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

    // Base attendee list for a specific conference code.
    let query = supabase
      .from('registrations')
      .select(
        'id, conference_code, first_name, last_name, organisation, email, phone, investment_focus, created_at, checked_in, checked_in_at',
      )
      .eq('conference_code', conferenceCode)
      .order('created_at', { ascending: false });

    // Apply simple name/email search for dashboard filtering.
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('[list-attendees] Query error', error);
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'Failed to load attendees from Supabase.',
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

    const attendees = (data ?? []).map((row: any) => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      organisation: row.organisation,
      phone: row.phone,
      investmentFocus: row.investment_focus,
      createdAt: row.created_at,
      status: row.checked_in ? 'Confirmed' : 'Registered',
      checkedIn: !!row.checked_in,
      checkedInAt: row.checked_in_at,
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        attendees,
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
    console.error('[list-attendees] Unexpected error', err);
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Unexpected error while listing attendees.',
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

