import axios from "axios";
// import { requestUrl } from "../../helpers/requestUrl";
import Cookies from 'universal-cookie';

export default async function authUser(data) {
  const cookies = new Cookies();
  try {
    const res = await axios({
      method: "post",
      url: "http://localhost:3010?redirectURL=http://localhost:3011",
      data: data,
      headers: {'Content-Type':'application/json'},
    })
    cookies.set('access_token', res.data.Access_Token);
    return res.data;
  } catch (error) {
    console.error("error in auth user  " + error.response.data);
  }
}