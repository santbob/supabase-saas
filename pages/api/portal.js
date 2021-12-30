import { supabase } from "../../utils/supabase";
import cookie from 'cookie';
import initStripe from 'stripe'


const handler = async (req, res) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }
  const token = cookie.parse(req.headers.cookie || '')['sb:token'];

  supabase.auth.session = () => ({
    access_token: token
  })

  const { data: { stripe_customer_id } } = await supabase
    .from("profile")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.billingPortal.sessions.create({
    customer: stripe_customer_id,
    return_url: `${process.env.BASE_URL}/dashboard`,
  });

  res.send({
    url: session.url,
  });
}

export default handler;