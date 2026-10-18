import { getAccount } from './account-auth';
import Login from './login';
export const dynamic='force-dynamic';
export async function generateMetadata(){const user=await getAccount();return {title:user?`${user.nickname}’s library — Your next chapter`:'little library — Your private reading room'}}
export default async function Home(){const user=await getAccount();return user?<iframe src="/library/index.html" title={`${user.nickname}’s library`} style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0}}/>:<Login/>}
