// server/api/ideas.js
import { supabaseServer } from "./_lib/supabase.js";
import { withAuth } from "./_utils/withAuth.js";

/**
 * IDEAS API
 *
 * GET    /api/ideas?user_id=...
 * POST   /api/ideas
 * PATCH  /api/ideas
 */

async function handler(req, res) {

  try {
    /* =====================================================
       GET — LIST IDEAS (pair scoped)
    ===================================================== */
    if (req.method === "GET") {
      const user_id = req.user.id;

      if (!user_id) {
        return res.status(400).json({ ok: false, error: "missing_user_id" });
      }

      // Find partner pair
      const { data: pair } = await supabaseServer
        .from("partners")
        .select("*")
        .or(`user_a.eq.${user_id},user_b.eq.${user_id}`)
        .maybeSingle();

      let data, error;

      if (pair) {
        // Paired: show ideas for the pair AND any ideas added by either user before pairing
        ({ data, error } = await supabaseServer
          .from("ideas")
          .select("*")
          .or(`pair_id.eq.${pair.id},added_by.in.(${pair.user_a},${pair.user_b})`)
          .order("created_at", { ascending: false }));
      } else {
        // Solo: show only this user's own ideas
        ({ data, error } = await supabaseServer
          .from("ideas")
          .select("*")
          .eq("added_by", user_id)
          .order("created_at", { ascending: false }));
      }

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      return res.status(200).json({
        ok: true,
        ideas: data || [],
      });
    }

    /* =====================================================
       POST — CREATE IDEA
    ===================================================== */
    if (req.method === "POST") {
      const { title, url, category, image_url, tags } = req.body || {};
      const added_by = req.user.id;

      if (!title || !added_by) {
        return res.status(400).json({ ok: false, error: "missing_params" });
      }

      // Find partner pair (optional — solo users can still add ideas)
      const { data: pair } = await supabaseServer
        .from("partners")
        .select("*")
        .or(`user_a.eq.${added_by},user_b.eq.${added_by}`)
        .maybeSingle();

      const { data, error } = await supabaseServer
        .from("ideas")
        .insert({
          title,
          url,
          category,
          image_url,
          tags: Array.isArray(tags) ? tags : [],
          added_by,
          pair_id: pair?.id || null,
          status: "active",
          votes: { [added_by]: "yes" } // Initial vote from creator
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      // Timeline event
      if (pair?.id) {
        await supabaseServer.from("timeline_events").insert({
          pair_id: pair.id,
          type: "idea_added",
          actor_id: added_by,
          payload: {
            idea_id: data.id,
            title: data.title,
            category: data.category,
            image_url: data.image_url || null,
          },
        });

        // Also create a notification for the partner
        const partner_id = pair.user_a === added_by ? pair.user_b : pair.user_a;
        if (partner_id) {
          await supabaseServer.from("notifications").insert({
            user_id: partner_id,
            type: "idea_vote_request",
            text: `New idea: "${title}". Let's go?`,
            payload: {
              idea_id: data.id,
              title: data.title,
              added_by_name: req.user.user_metadata?.full_name || "Partner"
            }
          });
        }
      }

      return res.status(200).json({ ok: true, idea: data });
    }

    /* =====================================================
       PATCH — UPDATE IDEA STATUS
    ===================================================== */
    if (req.method === "PATCH") {
      const { idea_id, action } = req.body || {};
      const user_id = req.user.id;

      if (!idea_id || !action) {
        return res.status(400).json({ ok: false, error: "missing_params" });
      }

      let update = {};

      if (action === "mark_done") {
        update = { status: "done", done_at: new Date().toISOString() };
      } else if (action === "archive") {
        update = { status: "archived" };
      } else if (action === "vote") {
        const { vote } = req.body;
        if (!vote) return res.status(400).json({ ok: false, error: "missing_vote" });

        // Get current idea to update votes JSON
        const { data: currentIdea, error: fetchError } = await supabaseServer
          .from("ideas")
          .select("*")
          .eq("id", idea_id)
          .single();

        if (fetchError || !currentIdea) {
          console.error("fetch idea error", fetchError);
          return res.status(404).json({ ok: false, error: "idea_not_found" });
        }

        const newVotes = { ...(currentIdea.votes || {}), [user_id]: vote };
        update = { votes: newVotes };

        // Check if both partners voted 'yes'
        if (currentIdea.pair_id) {
          const { data: pair } = await supabaseServer
            .from("partners")
            .select("*")
            .eq("id", currentIdea.pair_id)
            .single();

          if (pair) {
            const bothVotedYes = newVotes[pair.user_a] === "yes" && newVotes[pair.user_b] === "yes";
            if (bothVotedYes) {
              update.status = "priority";
              
              // Timeline event for reaching Priority
              await supabaseServer.from("timeline_events").insert({
                pair_id: currentIdea.pair_id,
                type: "idea_priority",
                actor_id: user_id,
                payload: {
                  idea_id: idea_id,
                  title: currentIdea.title, // Note: currentIdea might need title in select
                },
              });
            }
          }
        }
      } else {
        return res.status(400).json({ ok: false, error: "unknown_action" });
      }

      const { data, error } = await supabaseServer
        .from("ideas")
        .update(update)
        .eq("id", idea_id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      // Optional timeline event
      if (action === "mark_done" && user_id) {
        await supabaseServer.from("timeline_events").insert({
          pair_id: data.pair_id,
          type: "idea_done",
          actor_id: user_id,
          payload: {
            idea_id: data.id,
            title: data.title,
          },
        });
      }

      return res.status(200).json({ ok: true, idea: data });
    }

    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (err) {
    console.error("ideas api error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}

export default withAuth(handler);
