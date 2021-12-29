import { supabase } from "../utils/supabase";
import Link from "next/link";
import { useUser } from "../context/user";

export default function Home({ lessons }) {
  const { user } = useUser();
  console.log(user);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {lessons.map((lesson) => (
        <Link key={lesson.id} href={`/${lesson.id}`}>
          <a className="p-8 h-40 mb-4 rounded shadow text-xl flex">{lesson.title}</a>
        </Link >
      ))}
    </div>
  )
}

export const getStaticProps = async () => {
  const { data: lessons } = await supabase.from('lesson').select('*');
  return {
    props: {
      lessons,
    },
  }
}