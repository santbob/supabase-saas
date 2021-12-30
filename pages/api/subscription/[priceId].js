import { supabase } from "../../../utils/supabase";
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
  const { priceId } = req.query;
  const lineItems = [{
    price: priceId,
    quantity: 1,
  }]

  console.log({ lineItems })

  const checkoutConfig = {
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${process.env.BASE_URL}/payment/success`,
    cancel_url: `${process.env.BASE_URL}/payment/cancel`,
    customer: stripe_customer_id,
    mode: 'subscription',
  }

  const session = await stripe.checkout.sessions.create(checkoutConfig);

  res.send({
    sessionId: session.id,
  });

}

export default handler;