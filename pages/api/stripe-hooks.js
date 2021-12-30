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

  switch (event.type) {
    case 'customer.subscription.created':
      await supabase
        .from('profile')
        .update({
          is_subscribed: true,
          interval: event.data.object.items.data[0].plan.interval,
        })
        .eq('stripe_customer_id', event.data.object.customer);
      break;
    case 'customer.subscription.updated':
      console.log('customer.subscription.updated');
      break;
    case 'customer.subscription.deleted':
      console.log('customer.subscription.deleted');
      break;
  }

  console.log({ event });
  res.send({ recieved: true });
}

export default handler