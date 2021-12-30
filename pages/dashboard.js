import { supabase } from "../utils/supabase";
import { useUser } from '../context/user';
import axios from "axios";
import { useRouter } from "next/router";

const Dashboard = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const loadPortal = async () => {
    const { data } = await axios.get("/api/portal");
    router.push(data.url);
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-8">
      <h1 className="text-3xl mb-6">Dashboard</h1>
      {!isLoading && (
        <>
          <p>
            {user?.is_subscribed ? `Subscribed to ${user.subscribed_to_plan} paying ${user.interval}ly` : "Not subscribed"}
          </p>
          <button onClick={loadPortal}>Manage Subscription</button>
        </>
      )}
    </div>
  );
}

export const getServerSideProps = async ({ req }) => {
  const { user } = await supabase.auth.api.getUserByCookie(req)
  // if the user is not logged in, redirect to login
  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
      props: {

      }
    }
  }
  // else no props required, return empty props
  return {
    props: {}
  }
}

export default Dashboard;