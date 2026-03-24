// Supabase Edge Function: export-attendees
// Exports conference attendees as CSV, XLSX, or PDF.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExportFormat = 'csv' | 'excel' | 'pdf';

type ExportRow = {
  name: string;
  email: string;
  organisation: string;
  phone: string;
  investmentFocus: string;
  status: string;
  createdAt: string;
};

const buildRows = (rows: any[]): ExportRow[] =>
  rows.map((row) => ({
    name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
    email: row.email ?? '',
    organisation: row.organisation ?? '',
    phone: row.phone ?? '',
    investmentFocus: row.investment_focus ?? '',
    status: row.checked_in ? 'Confirmed' : 'Registered',
    createdAt: row.created_at ?? '',
  }));

const toCsvBytes = (rows: ExportRow[]) => {
  const headers = [
    'Name',
    'Email',
    'Organisation',
    'Phone',
    'Investment Focus',
    'Status',
    'Registered At',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.name,
        row.email,
        row.organisation,
        row.phone,
        row.investmentFocus,
        row.status,
        row.createdAt,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ];
  return new TextEncoder().encode(lines.join('\n'));
};

const toExcelBytes = (rows: ExportRow[]) => {
  const worksheetRows = rows.map((row) => ({
    Name: row.name,
    Email: row.email,
    Organisation: row.organisation,
    Phone: row.phone,
    'Investment Focus': row.investmentFocus,
    Status: row.status,
    'Registered At': row.createdAt,
  }));
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetRows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
};

const toPdfBytes = async (rows: ExportRow[]) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 842; // A4 landscape
  const pageHeight = 595;
  const margin = 24;
  const tableStartX = margin;
  const tableTopY = pageHeight - 76;
  const rowHeight = 18;
  const titleY = pageHeight - 32;
  const cellPadding = 4;
  const fontSize = 7;

  const columns: { key: keyof ExportRow; label: string; width: number }[] = [
    { key: 'name', label: 'Name', width: 120 },
    { key: 'email', label: 'Email', width: 190 },
    { key: 'organisation', label: 'Organisation', width: 140 },
    { key: 'phone', label: 'Phone', width: 90 },
    { key: 'investmentFocus', label: 'Investment Focus', width: 150 },
    { key: 'status', label: 'Status', width: 65 },
  ];

  const fitText = (text: string, maxWidth: number, isBold = false) => {
    const targetFont = isBold ? bold : font;
    const ellipsis = '...';
    if (targetFont.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;
    let output = text;
    while (output.length > 0) {
      output = output.slice(0, -1);
      const withDots = `${output}${ellipsis}`;
      if (targetFont.widthOfTextAtSize(withDots, fontSize) <= maxWidth) return withDots;
    }
    return ellipsis;
  };

  const drawHeaderRow = (page: any, yTop: number) => {
    let x = tableStartX;
    for (const col of columns) {
      page.drawRectangle({
        x,
        y: yTop - rowHeight,
        width: col.width,
        height: rowHeight,
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 0.8,
        color: rgb(0.93, 0.95, 0.97),
      });
      page.drawText(fitText(col.label, col.width - cellPadding * 2, true), {
        x: x + cellPadding,
        y: yTop - rowHeight + 6,
        size: fontSize,
        font: bold,
        color: rgb(0.1, 0.1, 0.1),
      });
      x += col.width;
    }
  };

  const drawDataRow = (page: any, yTop: number, row: ExportRow) => {
    let x = tableStartX;
    for (const col of columns) {
      const value = String(row[col.key] ?? '');
      page.drawRectangle({
        x,
        y: yTop - rowHeight,
        width: col.width,
        height: rowHeight,
        borderColor: rgb(0.78, 0.78, 0.78),
        borderWidth: 0.6,
      });
      page.drawText(fitText(value, col.width - cellPadding * 2), {
        x: x + cellPadding,
        y: yTop - rowHeight + 6,
        size: fontSize,
        font,
        color: rgb(0.12, 0.12, 0.12),
      });
      x += col.width;
    }
  };

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = tableTopY;

  const drawPageTitleAndHeader = () => {
    page.drawText('Joe Gqabi Attendee Export', {
      x: tableStartX,
      y: titleY,
      size: 14,
      font: bold,
      color: rgb(0.1, 0.1, 0.1),
    });
    drawHeaderRow(page, cursorY);
    cursorY -= rowHeight;
  };

  drawPageTitleAndHeader();

  for (const row of rows) {
    if (cursorY - rowHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = tableTopY;
      drawPageTitleAndHeader();
    }
    drawDataRow(page, cursorY, row);
    cursorY -= rowHeight;
  }

  return await pdfDoc.save();
};

const timestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ ok: false, message: 'Missing Supabase config.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json().catch(() => null)) as
      | { conferenceCode?: string; format?: ExportFormat }
      | null;

    const conferenceCode = body?.conferenceCode?.trim();
    const format = body?.format;

    if (!conferenceCode) {
      return new Response(JSON.stringify({ ok: false, message: 'conferenceCode is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!format || !['csv', 'excel', 'pdf'].includes(format)) {
      return new Response(JSON.stringify({ ok: false, message: 'Invalid format.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('registrations')
      .select(
        'first_name,last_name,email,organisation,phone,investment_focus,created_at,checked_in'
      )
      .eq('conference_code', conferenceCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[export-attendees] query error', error);
      return new Response(JSON.stringify({ ok: false, message: 'Failed to load attendees.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rows = buildRows(data ?? []);
    const stamp = timestamp();

    if (format === 'csv') {
      const bytes = toCsvBytes(rows);
      return new Response(bytes, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="attendees-${stamp}.csv"`,
        },
      });
    }

    if (format === 'excel') {
      const bytes = toExcelBytes(rows);
      return new Response(bytes, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="attendees-${stamp}.xlsx"`,
        },
      });
    }

    const bytes = await toPdfBytes(rows);
    return new Response(bytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="attendees-${stamp}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[export-attendees] unexpected error', err);
    return new Response(JSON.stringify({ ok: false, message: 'Unexpected export error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

