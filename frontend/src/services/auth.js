import axios from "axios";
import Cookies from 'universal-cookie';

export default async function authUser(data) {
  const cookies = new Cookies();
  try {
    const redirectURL = window.location.href.split("=")[1];
    const res = await axios({
      method: "post",
      url: `${process.env.REACT_APP_SSO_SERVER_URL}?redirectURL=${redirectURL}`,
      data: data,
      headers: {'Content-Type':'application/json'},
    })
    cookies.set('user_id', res.data.user_id);
    cookies.set('access_token', res.data.Access_Token);
    return res.data;
  } catch (error) {
    console.error("error in auth user  " + error.response.data);
  }
}
