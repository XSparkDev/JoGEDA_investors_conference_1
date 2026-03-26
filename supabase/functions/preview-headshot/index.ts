import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_HEADSHOT_BUCKET = 'attendee-headshots';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const bucketName = Deno.env.get('HEADSHOT_BUCKET') || DEFAULT_HEADSHOT_BUCKET;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ ok: false, message: 'Missing Supabase config.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const registrationId = url.searchParams.get('id')?.trim();
    const conferenceCode = url.searchParams.get('conferenceCode')?.trim();

    if (!registrationId) {
      return new Response(JSON.stringify({ ok: false, message: 'id is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let query = supabase
      .from('registrations')
      .select(
        'id, conference_code, first_name, last_name, photo_consent, headshot_path, headshot_mime',
      )
      .eq('id', registrationId)
      .limit(1);

    if (conferenceCode) {
      query = query.eq('conference_code', conferenceCode);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('[preview-headshot] registration query error', error);
      return new Response(JSON.stringify({ ok: false, message: 'Failed to load attendee.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ ok: false, message: 'Attendee not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data.photo_consent) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Headshot cannot be previewed: no photo consent.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (!data.headshot_path) {
      return new Response(
        JSON.stringify({ ok: false, message: 'No headshot available for this attendee.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: fileBytes, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(data.headshot_path);

    if (downloadError || !fileBytes) {
      console.error('[preview-headshot] storage download error', downloadError);
      return new Response(
        JSON.stringify({ ok: false, message: 'Failed to download headshot from storage.' }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const contentType = data.headshot_mime || fileBytes.type || 'application/octet-stream';
    const firstName = (data.first_name || '').trim();
    const lastName = (data.last_name || '').trim();
    const fallbackName = 'attendee';
    const safeName = `${firstName}-${lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || fallbackName;

    return new Response(fileBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeName}-headshot"`,
      },
    });
  } catch (err) {
    console.error('[preview-headshot] unexpected error', err);
    return new Response(JSON.stringify({ ok: false, message: 'Unexpected preview error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

