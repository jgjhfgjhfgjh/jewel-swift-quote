import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    // přímý dotaz místo RPC has_role — ta na živé DB neexistuje
    const { data: adminRole } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!adminRole) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;
    const targetUserId = body?.user_id as string;
    if (!targetUserId || !action) {
      return new Response(JSON.stringify({ error: 'Missing user_id or action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'set_password') {
      const newPassword = body?.password as string;
      if (!newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'Heslo musí mít alespoň 6 znaků' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { error } = await admin.auth.admin.updateUserById(targetUserId, { password: newPassword });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'send_recovery' || action === 'send_magic_link') {
      const { data: userData, error: getErr } = await admin.auth.admin.getUserById(targetUserId);
      if (getErr || !userData?.user?.email) {
        return new Response(JSON.stringify({ error: 'Email zákazníka nenalezen' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const email = userData.user.email;
      const redirectTo = body?.redirect_to as string | undefined;

      // generateLink odkaz jen vygeneruje, ale email NEodešle — posíláme přes
      // GoTrue auth API, které email reálně doručí
      const plainClient = createClient(SUPABASE_URL, ANON_KEY);
      const { error } = action === 'send_recovery'
        ? await plainClient.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)
        : await plainClient.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false, ...(redirectTo ? { emailRedirectTo: redirectTo } : {}) },
          });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true, email }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete_user') {
      if (targetUserId === user.id) {
        return new Response(JSON.stringify({ error: 'Nemůžete smazat vlastní účet' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: targetAdmin } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .eq('role', 'admin')
        .maybeSingle();
      if (targetAdmin) {
        return new Response(JSON.stringify({ error: 'Účet s rolí admin nelze smazat' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
      if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DB nemá FK kaskády na auth.users — související řádky uklízíme ručně.
      // Zprávy v komunikaci zůstávají (mají author_name), jen se odpojí autor.
      const warnings: string[] = [];
      const cleanups: [string, PromiseLike<{ error: { message: string } | null }>][] = [
        ['wishlist', admin.from('wishlist').delete().eq('user_id', targetUserId)],
        ['customer_discounts', admin.from('customer_discounts').delete().eq('customer_user_id', targetUserId)],
        ['customer_services', admin.from('customer_services').delete().eq('customer_user_id', targetUserId)],
        ['comm_participants', admin.from('comm_participants').delete().eq('user_id', targetUserId)],
        ['comm_messages', admin.from('comm_messages').update({ author_user_id: null }).eq('author_user_id', targetUserId)],
        ['user_roles', admin.from('user_roles').delete().eq('user_id', targetUserId)],
        ['profiles', admin.from('profiles').delete().eq('user_id', targetUserId)],
      ];
      for (const [table, op] of cleanups) {
        const { error } = await op;
        if (error) warnings.push(`${table}: ${error.message}`);
      }

      return new Response(JSON.stringify({ ok: true, warnings }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
