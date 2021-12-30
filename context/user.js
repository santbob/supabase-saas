import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '../utils/supabase';
import { useRouter } from "next/router";
import axios from "axios";

const Context = createContext();
const Provider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(supabase.auth.user());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserPofile = async () => {
      const sessionUser = supabase.auth.user();

      if (sessionUser) {
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        setUser({
          ...sessionUser,
          ...profile,
        });
        setIsLoading(false);
      }
    }
    supabase.auth.onAuthStateChange(() => {
      getUserPofile();
    });
    getUserPofile()
  }, [])

  useEffect(async () => {
    await axios.post('/api/set-supabase-cookie', {
      event: user ? 'SIGNED_IN' : 'SIGNED_OUT',
      session: supabase.auth.session(),
    });
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  const login = async () => {
    await supabase.auth.signIn({
      provider: "github",
    })
  }
  const exposed = {
    user,
    login,
    logout,
    isLoading,
  }
  return <Context.Provider value={exposed}>{children}</Context.Provider>;
}

export const useUser = () => useContext(Context);

export default Provider;