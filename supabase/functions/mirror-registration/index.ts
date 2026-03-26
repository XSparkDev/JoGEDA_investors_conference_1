// Supabase Edge Function: mirror-registration
// Mirrors XS Card registrations into the `registrations` table in Supabase Postgres.
// Runtime: Deno (Supabase Edge Functions)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type MirrorRequestBody = {
  xsPayload: Record<string, unknown>;
  extended: {
    conferenceCode: string;
    firstName: string;
    lastName: string;
    preferredName?: string;
    title?: string;
    organisation?: string;
    email: string;
    phone?: string;
    bio?: string;
    investmentFocus?: string;
    linkedinWebsite?: string;
    photoConsent?: boolean;
    codeOfConduct?: boolean;
    photographyConsent?: boolean;
    xsUserId?: string;
  };
};

const DEFAULT_HEADSHOT_BUCKET = 'attendee-headshots';

const safeFileName = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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
      console.error('[mirror-registration] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
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

    const contentType = req.headers.get('content-type') ?? '';
    let body: MirrorRequestBody | null = null;
    let headshotFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData().catch(() => null);
      const extendedRaw = form?.get('extended');
      const xsPayloadRaw = form?.get('xsPayload');
      const headshotRaw = form?.get('headshot');

      const extended =
        typeof extendedRaw === 'string'
          ? (JSON.parse(extendedRaw) as MirrorRequestBody['extended'])
          : null;
      const xsPayload =
        typeof xsPayloadRaw === 'string'
          ? (JSON.parse(xsPayloadRaw) as MirrorRequestBody['xsPayload'])
          : {};

      if (headshotRaw instanceof File && headshotRaw.size > 0) {
        headshotFile = headshotRaw;
      }

      if (extended) {
        body = { xsPayload, extended };
      }
    } else {
      // Backward-compatible JSON body support.
      body = (await req.json().catch(() => null)) as MirrorRequestBody | null;
    }

    if (!body || !body.extended) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'Invalid payload. Expected multipart or JSON with { xsPayload, extended }.',
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

    const {
      conferenceCode,
      firstName,
      lastName,
      preferredName,
      title,
      organisation,
      email,
      phone,
      bio,
      investmentFocus,
      linkedinWebsite,
      photoConsent,
      codeOfConduct,
      photographyConsent,
      xsUserId,
    } = body.extended;

    if (!conferenceCode || !firstName || !lastName || !email) {
      return new Response(
        JSON.stringify({
          ok: false,
          message:
            'Missing required registration fields (conferenceCode, firstName, lastName, email).',
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

    // Persist the merged registration payload for dashboard/search/check-in.
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        conference_code: conferenceCode,
        first_name: firstName,
        last_name: lastName,
        preferred_name: preferredName,
        title,
        organisation,
        email,
        phone,
        bio,
        investment_focus: investmentFocus,
        linkedin_website: linkedinWebsite,
        photo_consent: !!photoConsent,
        code_of_conduct: !!codeOfConduct,
        photography_consent: !!photographyConsent,
        xs_user_id: xsUserId ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[mirror-registration] Insert error', error);
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'Failed to record registration in Supabase.',
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

    const registrationId = data?.id ?? null;
    const shouldUploadHeadshot = Boolean(photoConsent) && headshotFile && registrationId;

    if (shouldUploadHeadshot) {
      const bucketName = Deno.env.get('HEADSHOT_BUCKET') || DEFAULT_HEADSHOT_BUCKET;
      const originalName = headshotFile.name || 'headshot.jpg';
      const fileName = safeFileName(originalName) || 'headshot.jpg';
      const storagePath = `${conferenceCode}/${registrationId}/${Date.now()}-${fileName}`;
      const mimeType = headshotFile.type || 'application/octet-stream';

      const uploadRes = await supabase.storage
        .from(bucketName)
        .upload(storagePath, headshotFile, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadRes.error) {
        console.error('[mirror-registration] Headshot upload error', uploadRes.error);
        return new Response(
          JSON.stringify({
            ok: false,
            message: 'Registration recorded, but failed to upload headshot.',
            registrationId,
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

      const { error: updateErr } = await supabase
        .from('registrations')
        .update({
          headshot_path: storagePath,
          headshot_uploaded_at: new Date().toISOString(),
          headshot_mime: mimeType,
        })
        .eq('id', registrationId);

      if (updateErr) {
        console.error('[mirror-registration] Headshot metadata update error', updateErr);
        return new Response(
          JSON.stringify({
            ok: false,
            message: 'Registration recorded, but failed to save headshot metadata.',
            registrationId,
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
    }

    return new Response(
      JSON.stringify({
        ok: true,
        registrationId,
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
    console.error('[mirror-registration] Unexpected error', err);
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Unexpected error while recording registration in Supabase.',
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

