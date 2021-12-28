import React, { Component, useState } from "react";
import "../assets/styles/Login-Register.css";
import authUser from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setEmailFunction = (e) => {
    setEmail(e.target.value);
  };

  const setPasswordFunction = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      var data = { username: email, user_password: password };
      const redirectURL = window.location.href.split("=")[1];
      await authUser(data).then((response_data) => {
        if (response_data.response) {
          window.location.href = redirectURL;
        }
      });
    }
  };
  
  return (
    <div className="sign-up-page">
      <div className="sign-up-wrapper">
        <h2 className="sign-up-title">Giriş Yap</h2>
        <form action="" onSubmit={(e) => handleSubmit(e)}>
          <div className="form-item">
            <div className="form-item-input">
              <i className="fas fa-envelope"></i>
              <input
                name="username"
                type="text"
                placeholder="user name..."
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
                placeholder="Şifre..."
                onChange={(e) => setPasswordFunction(e)}
                required
              />
            </div>
          </div>
          <div className="form-item form-btns ">
            <button className="form-btn form-btn-login login-btn btn-cursor">
              GİRİŞ YAP
            </button>{" "}
          </div>
        </form>
      </div>
    </div>
  );
}
