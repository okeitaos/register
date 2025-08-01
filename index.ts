import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
  try {
    const { userId, title, firstName, lastName, email, phone, uploaded_image_urls, displayName, pictureUrl, pdpaConsent } = await req.json();
    if (!userId || !firstName || !lastName) {
      throw new Error('Missing required fields.');
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not set in environment variables.');
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabaseClient.from('registrations').upsert({
      user_id: userId,
      title: title || null,
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      uploaded_image_urls: uploaded_image_urls || [],
      display_name: displayName || null,
      picture_url: pictureUrl || null,
      pdpa_consent: pdpaConsent || false
    }, {
      onConflict: 'user_id'
    });
    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 500
      });
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 400
    });
  }
});
