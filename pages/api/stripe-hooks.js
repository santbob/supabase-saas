import initStripe from 'stripe';
import { buffer } from 'micro';

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
  console.log({ event });
  res.send({ recieved: true });
}

export default handler