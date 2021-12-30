import initStripe from 'stripe';
import { buffer } from 'micro';
import { getServiceSupabase } from '../../utils/supabase';

export const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  console.log("event recieved");
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const reqBuffer = await buffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret)
  } catch (error) {
    console.log('error in constuctEvent of webhook', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const supabase = getServiceSupabase();

  const getProductName = async (productId) => {
    const { name } = await stripe.products.retrieve(event.data.object.plan.product);
    return name;
  }

  switch (event.type) {
    case 'customer.subscription.updated':
      const planName = await getProductName(event.data.object.plan.product);
      await supabase
        .from('profile')
        .update({
          is_subscribed: true,
          interval: event.data.object.items.data[0].plan.interval,
          subscribed_to_plan: planName,
        })
        .eq('stripe_customer_id', event.data.object.customer);
      break;
    case 'customer.subscription.deleted':
      await supabase
        .from('profile')
        .update({
          is_subscribed: false,
          interval: null,
          subscribed_to_plan: null,
        })
        .eq('stripe_customer_id', event.data.object.customer);
      break;
  }
  console.log('event data object ', JSON.stringify(event.data.object));
  console.log({ event });
  res.send({ recieved: true });
}

export default handler