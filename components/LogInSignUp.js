import React from "react";
import Link from "next/link";
import { Button } from "./ui";

const LogInSignUp = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <Link href="/login" passHref>
        <Button>Log In</Button>
      </Link>
      <Link href="/signup" passHref>
        <Button>Sign Up</Button>
      </Link>
    </div>
  );
};

export default LogInSignUp;
