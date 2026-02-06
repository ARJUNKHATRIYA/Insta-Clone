import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        input,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/pexels-laura-tancredi-7078283.jpg')" }}
    >
      {/* DARK OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-black/40" />

      {/* GLASS CARD */}
      <div
        className="
          relative z-10
          w-full max-w-md
          bg-white/30
          backdrop-blur-2xl
          border border-white/40
          rounded-2xl
          shadow-2xl
          px-8 py-10
          animate-[fadeIn_0.5s_ease-out]
        "
      >
        <h1 className="text-3xl font-semibold mb-2 text-black">
          Welcome back
        </h1>
        <p className="text-sm text-black/70 mb-8">
          Please enter your details.
        </p>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-black">
              E-mail
            </label>
            <Input
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="
                mt-1
                bg-white/70
                border border-white/50
                text-black
                focus:ring-0
              "
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-black">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="
                mt-1
                bg-white/70
                border border-white/50
                text-black
                focus:ring-0
              "
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-black
              hover:bg-black/90
              text-white
              transition-all
              disabled:opacity-70
            "
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Log in
          </Button>
        </form>

        <p className="text-sm text-center text-black/70 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
