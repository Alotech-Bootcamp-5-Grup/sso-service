import React, { Component, useState } from "react";
import "../assets/styles/Login-Register.css";
// import { Link } from "react-router-dom";
// import loginUser from "../services/auth/login";

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
      var data = { email: email, password: password };
      // await loginUser(data);
    }
  };
  return (
    <div className="sign-up-page">
      <div className="sign-up-wrapper">
        <h2 className="sign-up-title">Giriş Yap</h2>
        <form action="" onSubmit={(e) => handleSubmit(e)}>
          {/* <div className="form-item">
              <img src={""} alt="Logo" className="form-img" />
            </div> */}
          <div className="form-item">
            <div className="form-item-input">
              <i className="fas fa-envelope"></i>
              <input
                name="email"
                type="email"
                placeholder="E-Mail..."
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
          {/* <div className="form-item">
            <p className="register">
              Üye değil misiniz? {"  "}
              <Link
                to="/auth/register"
                className="register-bold register-text-color"
              >
                Hemen Üye Ol!
              </Link>
            </p>
          </div> */}
        </form>
      </div>
    </div>
  );
}
