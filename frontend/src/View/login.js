import React, { useState } from "react";
import "../assets/styles/Login-Register.css";
import authUser from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // setEmailFunction sayesinde e mail'i set ediyoruz
  const setEmailFunction = (e) => {
    setEmail(e.target.value);
  };

  // setPasswordFunction sayesinde şifreyi'i set ediyoruz
  const setPasswordFunction = (e) => {
    setPassword(e.target.value);
  };

  // handleSubmit sayesinde aldığımız bilgileri kullanarak kullanıcıyı 
  // authUser servisimiz sayesinde authenticate ediyoruz.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // e mail ve password'un verilip verilmediğini kontro ediyoruz.
    if (email && password) {
      var data = { username: email, user_password: password };

      // burada hangi frontend'den login ekranına gelinmiş onu bulmak için = işaretine göre split edioyruz.
      // http://localhost:3010/?redirectURL=http://localhost:3000
      // örnek url 29. satırdaki gibi olucak. = ifadesine göre split edinde redirectUrli buluyoruz.
      const redirectURL = window.location.href.split("=")[1];
      await authUser(data).then((response_data) => {
        if (response_data.response) {
          // eğer authenticate başarlı olmuşsa geldiğimiz sayfaya tekrar redirectURL'i kullanarak geri gidiyoru.
          window.location.href = redirectURL;
        }
      });
    }
  };

  return (
    <div className="sign-up-page">
      <div className="sign-up-wrapper">
        <h2 className="sign-up-title">Login</h2>
        <form action="" onSubmit={(e) => handleSubmit(e)}>
          <div className="form-item">
            <div className="form-item-input">
              <i className="fas fa-envelope"></i>
              <input
                name="username"
                type="text"
                placeholder="User Name..."
                onChange={(e) => setEmailFunction(e)}
                required
              />
            </div>
          </div>

          <div className="form-item">
            <div className="form-item-input">
              <i className="fas fa-lock"></i>
              <input
                name="password"
                type="password"
                placeholder="Password..."
                onChange={(e) => setPasswordFunction(e)}
                required
              />
            </div>
          </div>
          <div className="form-item form-btns ">
            <button className="form-btn form-btn-login login-btn btn-cursor">
              Login
            </button>{" "}
          </div>
        </form>
      </div>
    </div>
  );
}
