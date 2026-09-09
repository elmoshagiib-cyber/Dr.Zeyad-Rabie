import { useNavigate } from "react-router-dom";
import { LoginButton } from "./LoginButton";
import { RegisterButton } from "./RegisterButton";

interface GuestActionsProps {
  navigate: ReturnType<typeof useNavigate>;
}

export function GuestActions({ navigate }: GuestActionsProps) {
  return (
    <div className="hidden md:flex items-center gap-2.5">
      <LoginButton />
      <RegisterButton />
    </div>
  );
}