import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        input,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
        setInput({ username: "", email: "", password: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) navigate("/");
  }, [user?._id]);

  return (
    <div
      className="min-h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/auth-bg.jpg')" }}
    >
      {/* GLASS CARD */}
      <div
        className="
          w-full max-w-md
          bg-white/30
          backdrop-blur-2xl
          border border-white/40
          rounded-2xl
          shadow-2xl
          px-10 py-12
          animate-fade-in
        "
      >
        <h1 className="text-3xl font-semibold mb-2 text-black">
          Create an account
        </h1>

        <p className="text-sm text-black/70 mb-8">
          Signup to see photos & videos from your friends.
        </p>

        <form onSubmit={signupHandler} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-black">Username</label>
            <Input
              name="username"
              autoComplete="username"
              value={input.username}
              onChange={changeEventHandler}
              className="mt-1 bg-white/60 border border-white/50 text-black focus:ring-0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-black">E-mail</label>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              value={input.email}
              onChange={changeEventHandler}
              className="mt-1 bg-white/60 border border-white/50 text-black focus:ring-0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-black">Password</label>
            <Input
              type="password"
              name="password"
              autoComplete="new-password"
              value={input.password}
              onChange={changeEventHandler}
              className="mt-1 bg-white/60 border border-white/50 text-black focus:ring-0"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-black/90 text-white transition"
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign up
          </Button>
        </form>

        <p className="text-sm text-center text-black/70 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
